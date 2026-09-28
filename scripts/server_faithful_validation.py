"""
Server-faithful /ws/audio validation harness.

This script bypasses the network layer but uses the EXACT same internal
functions the live /ws/audio pipeline uses:

    - VAD
    - WindowAccumulator (50% overlap)
    - 58-D feature extraction
    - Calibrated XGBoost (reports/xgboost_58d_calibrated.joblib)
    - DualStreamFusionClassifier (MMS-300M + 58-D DSP)
    - 50/50 XGB/Dual ensemble (mirrors server.fused ensemble logic)
    - RiskEngine + StreamManager + ScenarioResolver
    - NotificationEngine policy thresholds
    - evaluate_sector_result (sector governance)

For each clip we report:
    - max XGB probability
    - max dual probability
    - max ensemble probability
    - max rolling score
    - number of HIGH windows
    - alert_triggered
    - whether frontend routing would have accepted the result

The harness is fully self-contained and reads from disk-resident sector +
demo clips. It does NOT hardcode any filenames in detection logic — it only
uses the clips to drive the existing pipeline.
"""

from __future__ import annotations

import json
import sys
import time
import warnings
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

import numpy as np

# Silence harmless librosa/UserWarning noise on synthetic edge-tts audio.
warnings.filterwarnings("ignore", category=UserWarning, module="librosa")

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import joblib
import librosa

from src.config import SAMPLE_RATE, VAD_FRAME_SAMPLES
from src.features import extract_features
from src.fusion import fuse_acoustic_probabilities
from src.risk_engine.engine import RiskEngine
from src.risk_engine.notification_engine import (
    POLICIES,
    Scenario,
)
from src.risk_engine.scenario_resolver import resolve_scenario
from src.risk_engine.schemas import ModelPrediction, RiskResult
from src.risk_engine.stream_manager import StreamManager
from src.sectors.common.governance import evaluate_sector_result
from src.vad import VoiceActivityDetector
from src.window_accumulator import WindowAccumulator


MODEL_PATH = ROOT / "reports" / "xgboost_58d_calibrated.joblib"


@dataclass
class WindowReport:
    window_id: int
    xgb_prob: float
    dual_prob: Optional[float]
    ensemble_prob: float
    rolling_score: float
    consecutive_flags: int
    risk_level: str
    alert_triggered: bool


@dataclass
class ClipReport:
    label: str
    sector: str
    scenario: str
    expected: str  # "spoof" or "bonafide"
    n_windows: int
    max_xgb: float
    max_dual: Optional[float]
    max_ensemble: float
    max_rolling: float
    n_high_windows: int
    alert_triggered: bool
    notification_triggered: bool
    governance_decision: dict
    frontend_accepted: bool
    per_window: List[WindowReport] = field(default_factory=list)


def _load_audio(path: Path) -> np.ndarray:
    audio, _ = librosa.load(str(path), sr=SAMPLE_RATE, mono=True)
    return audio.astype(np.float32, copy=False)


def _split_into_vad_frames(audio: np.ndarray) -> List[np.ndarray]:
    n_frames = len(audio) // VAD_FRAME_SAMPLES
    return [
        audio[i * VAD_FRAME_SAMPLES : (i + 1) * VAD_FRAME_SAMPLES]
        for i in range(n_frames)
    ]


def _build_stream_manager(
    scenario: str,
    sector: str,
    transaction_amount_inr: Optional[float] = None,
) -> StreamManager:
    sm = StreamManager()
    sm.configure_stream(
        stream_id="validation",
        scenario=scenario,
        transaction_amount_inr=transaction_amount_inr,
        sector=sector,
    )
    return sm


def _notification_evaluator(
    sm: StreamManager, scenario: str, risk_result: RiskResult
) -> bool:
    policy = POLICIES[Scenario(scenario)]
    return risk_result.alert_triggered and risk_result.rolling_score >= policy.threshold


def _frontend_accepts(
    risk_result: RiskResult,
    notification_triggered: bool,
    governance_decision: dict,
) -> bool:
    """
    Reproduces the dashboard accept logic from the React frontend.
    A result is accepted if any of these are true:
      - alert_triggered
      - notification_triggered
      - governance_decision says block/hold/lock/etc.
      - risk_level is MEDIUM or HIGH
    The frontend also shows LOW results as 'monitoring' state (still routed).
    We accept all routed results so the test distinguishes "no RiskResult was
    sent" from "RiskResult was sent".
    """
    if risk_result.alert_triggered:
        return True
    if notification_triggered:
        return True
    if governance_decision and (
        governance_decision.get("action") in {
            "hold_and_escalate",
            "block_rights_and_escalate",
            "lock_folio_and_escalate",
        }
        or governance_decision.get("policy_violation")
    ):
        return True
    if risk_result.risk_level.value in ("MEDIUM", "HIGH"):
        return True
    return False


def run_clip(
    audio_path: Path,
    *,
    sector: str,
    scenario: str,
    governance_scenario: str,
    expected: str,
    label: str,
    xgb_model,
    dual_classifier,
    transaction_amount_inr: Optional[float] = None,
) -> ClipReport:
    audio = _load_audio(audio_path)

    vad = VoiceActivityDetector()
    accumulator = WindowAccumulator()
    stream_manager = _build_stream_manager(scenario, sector, transaction_amount_inr)

    max_xgb = 0.0
    max_dual: Optional[float] = None
    max_ensemble = 0.0
    max_rolling = 0.0
    n_high = 0
    alert_triggered_overall = False
    notification_triggered_overall = False
    governance_decision_overall: dict = {}
    per_window: List[WindowReport] = []

    frames = _split_into_vad_frames(audio)

    window_id = 0
    for frame in frames:
        if not vad.is_speech(frame):
            continue
        windows = accumulator.push(frame)

        for audio_window in windows:
            # Re-check speech on at least one inner frame (mirrors server).
            speech_in_window = any(
                vad.is_speech(audio_window[i : i + VAD_FRAME_SAMPLES])
                for i in range(0, len(audio_window), VAD_FRAME_SAMPLES)
                if len(audio_window[i : i + VAD_FRAME_SAMPLES]) == VAD_FRAME_SAMPLES
            )
            if not speech_in_window:
                continue

            window_id += 1

            raw_features = extract_features(audio_window).reshape(1, -1)
            xgb_prob = float(xgb_model.predict_proba(raw_features)[0, 1])
            xgb_prob = float(np.clip(xgb_prob, 0.0, 1.0))

            dual_prob: Optional[float] = None
            dual_valid = False
            if dual_classifier is not None:
                try:
                    res = dual_classifier.predict(audio_window)
                    cand = res.get("ai_probability")
                    if cand is not None and np.isfinite(cand):
                        dual_prob = float(np.clip(cand, 0.0, 1.0))
                        dual_valid = True
                except Exception:
                    dual_prob = None
                    dual_valid = False

            if dual_valid and dual_prob is not None:
                ensemble_prob = fuse_acoustic_probabilities(
                    xgb_probability=xgb_prob,
                    dual_probability=dual_prob,
                )
            else:
                ensemble_prob = float(np.clip(xgb_prob, 0.0, 1.0))

            prediction = ModelPrediction(
                stream_id="validation",
                window_id=window_id,
                timestamp=time.time(),
                ai_probability=ensemble_prob,
                model_version="ensemble-xgb-mms300m-v1",
            )
            risk_result = stream_manager.update(prediction)

            notification_triggered = _notification_evaluator(
                stream_manager, scenario, risk_result
            )

            # Build a result copy similar to server for governance.
            rdict = risk_result.model_dump()
            rdict["xgb_probability"] = round(xgb_prob, 4)
            rdict["dual_stream_probability"] = (
                round(dual_prob, 4) if dual_prob is not None else None
            )
            rdict["dual_stream_risk"] = (
                "HIGH" if (dual_prob is not None and dual_prob >= 0.70) else
                "MEDIUM" if (dual_prob is not None and dual_prob >= 0.40) else
                "LOW" if dual_prob is not None else None
            )
            rdict["modality_gate_alpha"] = 0.64
            rdict["dual_stream_latency_ms"] = None
            rdict["target_languages"] = ["en", "hi", "ta"]
            rdict["ensemble_mode"] = "xgb_mms300m_fusion"

            ctx = stream_manager.get_context("validation")
            # Sector governance expects the sector-specific scenario slug
            # (e.g. 'voice_authenticity'), not the NotificationEngine
            # policy enum name. The slug is carried by governance_scenario.
            governance_decision = evaluate_sector_result(
                rdict,
                sector=ctx.get("sector", sector),
                scenario=governance_scenario,
                transaction_amount_inr=ctx.get("transaction_amount_inr"),
                caller_id=None,
            )

            if risk_result.risk_level.value == "HIGH":
                n_high += 1
            if risk_result.alert_triggered:
                alert_triggered_overall = True
            if notification_triggered:
                notification_triggered_overall = True
            if governance_decision:
                governance_decision_overall = governance_decision

            max_xgb = max(max_xgb, xgb_prob)
            if dual_prob is not None:
                max_dual = dual_prob if max_dual is None else max(max_dual, dual_prob)
            max_ensemble = max(max_ensemble, ensemble_prob)
            max_rolling = max(max_rolling, risk_result.rolling_score)

            per_window.append(
                WindowReport(
                    window_id=window_id,
                    xgb_prob=xgb_prob,
                    dual_prob=dual_prob,
                    ensemble_prob=ensemble_prob,
                    rolling_score=risk_result.rolling_score,
                    consecutive_flags=risk_result.consecutive_flags,
                    risk_level=risk_result.risk_level.value,
                    alert_triggered=risk_result.alert_triggered,
                )
            )

    frontend_accepted = _frontend_accepts(
        # Synthesize a representative RiskResult for frontend-accept check
        # using the per-window maxima, so that even if no window triggered
        # we still capture routing-relevant state.
        RiskResult(
            stream_id="validation",
            window_id=window_id,
            timestamp=time.time(),
            ai_probability=max_ensemble,
            rolling_score=max_rolling,
            consecutive_flags=0,
            risk_level=__import__("src.risk_engine.schemas", fromlist=["RiskLevel"]).RiskLevel.HIGH
            if n_high > 0
            else __import__("src.risk_engine.schemas", fromlist=["RiskLevel"]).RiskLevel.LOW,
            alert_triggered=alert_triggered_overall,
            model_version="ensemble-xgb-mms300m-v1",
        ),
        notification_triggered_overall,
        governance_decision_overall,
    )

    return ClipReport(
        label=label,
        sector=sector,
        scenario=scenario,
        expected=expected,
        n_windows=window_id,
        max_xgb=max_xgb,
        max_dual=max_dual,
        max_ensemble=max_ensemble,
        max_rolling=max_rolling,
        n_high_windows=n_high,
        alert_triggered=alert_triggered_overall,
        notification_triggered=notification_triggered_overall,
        governance_decision=governance_decision_overall,
        frontend_accepted=frontend_accepted,
        per_window=per_window,
    )


def load_dual_classifier_or_none():
    try:
        from src.models.fused_acoustic_model import DualStreamFusionClassifier

        clf = DualStreamFusionClassifier()
        if clf.model is None:
            print(
                "[diag] Dual-stream model weights missing — treating dual as unavailable."
            )
            return None
        return clf
    except Exception as exc:
        print(f"[diag] Dual-stream classifier unavailable: {exc}")
        return None


def main():
    xgb_model = joblib.load(MODEL_PATH)
    print(f"[diag] Loaded XGB: {MODEL_PATH}")

    dual_classifier = load_dual_classifier_or_none()
    print(f"[diag] Dual-stream: {'available' if dual_classifier else 'unavailable'}")

    manifest_csv = ROOT / "reports" / "sector_manifest.csv"
    import csv

    rows: List[ClipReport] = []
    with open(manifest_csv, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            clip_path = ROOT / row["file_path"]
            if not clip_path.exists():
                print(f"[diag] missing: {clip_path}")
                continue

            # Scenario mapping for risk engine.
            sector = row["sector"]
            scenario_raw = row["scenario"]

            # Map manifest scenario -> NotificationEngine Scenario enum.
            # The NotificationEngine only knows the policies defined in
            # notification_engine.Scenario (high_value_transaction,
            # privileged_access, routine_support, guest_verification,
            # reservation_change, vip_booking). For sector governance
            # evaluation we keep the *original* sector scenario slug.
            scenario_map = {
                "retail": {
                    "order_modification": "routine_support",
                    "customer_care": "routine_support",
                },
                "hospitality": {
                    "vip_booking": "vip_booking",
                    "guest_verification": "guest_verification",
                    "reservation_change": "reservation_change",
                },
                "entertainment": {
                    "voice_authenticity": "privileged_access",
                    "dubbing_verification": "routine_support",
                    "speaker_comparison": "privileged_access",
                },
                "finance": {
                    "high_value_transfer": "high_value_transaction",
                    "customer_verification": "routine_support",
                    "account_recovery": "privileged_access",
                },
            }
            # The sector governance layer wants the *manifest* scenario slug
            # (e.g. 'voice_authenticity'), not the policy enum name.
            governance_scenario = scenario_raw
            scenario = scenario_map[sector].get(scenario_raw, "routine_support")

            transaction_amount_inr: Optional[float] = None
            if scenario == "high_value_transaction":
                transaction_amount_inr = 600_000.0
            elif scenario in ("vip_booking",):
                transaction_amount_inr = 200_000.0

            print(
                f"\n[diag] running: {row['filename']} "
                f"(sector={sector}, scenario={scenario}, label={row['label']})"
            )
            report = run_clip(
                clip_path,
                sector=sector,
                scenario=scenario,
                governance_scenario=governance_scenario,
                expected=row["label"],
                label=row["filename"],
                xgb_model=xgb_model,
                dual_classifier=dual_classifier,
                transaction_amount_inr=transaction_amount_inr,
            )
            rows.append(report)

            print(
                f"  windows={report.n_windows} "
                f"max_xgb={report.max_xgb:.3f} "
                f"max_dual={report.max_dual if report.max_dual is None else f'{report.max_dual:.3f}'} "
                f"max_ens={report.max_ensemble:.3f} "
                f"max_roll={report.max_rolling:.3f} "
                f"n_high={report.n_high_windows} "
                f"alert={report.alert_triggered} "
                f"notif={report.notification_triggered} "
                f"frontend_ok={report.frontend_accepted} "
                f"action={report.governance_decision.get('action') if report.governance_decision else None}"
            )

    # Summary table.
    print("\n" + "=" * 100)
    print(f"{'label':50} {'exp':8} {'xgb':>6} {'dual':>6} {'ens':>6} {'roll':>6} {'hi':>4} {'alert':>6} {'notif':>6} {'fe':>4}")
    print("=" * 100)
    for r in rows:
        dual_str = "NA" if r.max_dual is None else f"{r.max_dual:.3f}"
        print(
            f"{r.label:50} {r.expected:8} {r.max_xgb:6.3f} {dual_str:>6} "
            f"{r.max_ensemble:6.3f} {r.max_rolling:6.3f} {r.n_high_windows:>4} "
            f"{str(r.alert_triggered):>6} {str(r.notification_triggered):>6} "
            f"{str(r.frontend_accepted):>4}"
        )

    # Save JSON summary for regression tests.
    out = ROOT / "reports" / "validation_summary.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    payload = []
    for r in rows:
        payload.append(
            {
                "label": r.label,
                "sector": r.sector,
                "scenario": r.scenario,
                "expected": r.expected,
                "n_windows": r.n_windows,
                "max_xgb": r.max_xgb,
                "max_dual": r.max_dual,
                "max_ensemble": r.max_ensemble,
                "max_rolling": r.max_rolling,
                "n_high_windows": r.n_high_windows,
                "alert_triggered": r.alert_triggered,
                "notification_triggered": r.notification_triggered,
                "frontend_accepted": r.frontend_accepted,
                "governance_action": r.governance_decision.get("action")
                if r.governance_decision
                else None,
                "per_window": [
                    {
                        "window_id": w.window_id,
                        "xgb_prob": w.xgb_prob,
                        "dual_prob": w.dual_prob,
                        "ensemble_prob": w.ensemble_prob,
                        "rolling_score": w.rolling_score,
                        "consecutive_flags": w.consecutive_flags,
                        "risk_level": w.risk_level,
                        "alert_triggered": w.alert_triggered,
                    }
                    for w in r.per_window
                ],
            }
        )
    with open(out, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    print(f"\n[diag] Wrote {out}")


if __name__ == "__main__":
    main()
