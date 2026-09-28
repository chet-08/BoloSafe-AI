"""
End-to-end regression test for sector demo audio detection.

This test pins down the behavior of the production /ws/audio pipeline
(VAD -> 1s windows -> 58-D XGBoost -> dual-stream MMS-300M ->
XGB-canonical fusion -> RiskEngine -> NotificationEngine -> sector
governance) on every sector demo clip in this repository.

The test is the documented contract that the fix (src.fusion) must keep
honest. If any of these expected outcomes regress, this test fails and
points directly at the offending clip and metric.

It does NOT hardcode anything by filename that detection logic could
exploit. It is a black-box end-to-end check: the only inputs to the
test are the WAV files; the only outputs are the per-window telemetry
that the live pipeline already produces.

Required files (all present in this checkout):
    data/sectors/{finance,retail,hospitality,entertainment}/spoof/*.wav
    data/sectors/{finance,retail,hospitality,entertainment}/bonafide/*.wav

Optional demo files (skipped if absent, NOT generated):
    demo/cloned_voice.wav
    demo/TTSOL-en-US-BrianMultilingual-20260915-074841.wav
    demo/_Welcome to Echoes o.wav

The test mirrors what scripts/server_faithful_validation.py does, but
without the dual stream (which may be unavailable in some CI environments).
The dual stream is gated behind a try/except so the test still runs when
MMS-300M weights cannot be loaded.
"""

from __future__ import annotations

import math
import sys
import time
import warnings
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import joblib
import librosa
import numpy as np
import pytest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from src.config import SAMPLE_RATE, VAD_FRAME_SAMPLES
from src.features import extract_features
from src.fusion import fuse_acoustic_probabilities
from src.risk_engine.engine import RiskEngine
from src.risk_engine.notification_engine import POLICIES, Scenario
from src.risk_engine.scenario_resolver import resolve_scenario
from src.risk_engine.schemas import ModelPrediction, RiskLevel
from src.risk_engine.stream_manager import StreamManager
from src.sectors.common.governance import evaluate_sector_result
from src.vad import VoiceActivityDetector
from src.window_accumulator import WindowAccumulator

warnings.filterwarnings("ignore")


MODEL_PATH = ROOT / "reports" / "xgboost_58d_calibrated.joblib"


@dataclass
class ClipResult:
    label: str
    expected: str
    sector: str
    scenario: str
    n_windows: int
    max_xgb: float
    max_dual: Optional[float]
    max_ensemble: float
    max_rolling: float
    n_high_windows: int
    alert_triggered: bool
    notification_triggered: bool
    frontend_accepted: bool
    governance_action: Optional[str]
    final_risk_level: RiskLevel


def _load_dual_or_none():
    try:
        from src.models.fused_acoustic_model import DualStreamFusionClassifier

        clf = DualStreamFusionClassifier()
        if clf.model is None:
            return None
        return clf
    except Exception:
        return None


def _load_audio(path: Path) -> np.ndarray:
    audio, _ = librosa.load(str(path), sr=SAMPLE_RATE, mono=True)
    return audio.astype(np.float32, copy=False)


def _split_into_vad_frames(audio: np.ndarray):
    n = len(audio) // VAD_FRAME_SAMPLES
    return [audio[i * VAD_FRAME_SAMPLES : (i + 1) * VAD_FRAME_SAMPLES] for i in range(n)]


def _notification_evaluator(risk_result, scenario):
    policy = POLICIES[Scenario(scenario)]
    return bool(
        risk_result.alert_triggered
        and risk_result.rolling_score >= policy.threshold
    )


def _frontend_accepts(risk_result, notification_triggered, governance_decision):
    """Reproduces the dashboard accept logic from the React frontend."""
    if risk_result.alert_triggered:
        return True
    if notification_triggered:
        return True
    if governance_decision and governance_decision.get("action") in {
        "hold_and_escalate",
        "block_rights_and_escalate",
        "lock_folio_and_escalate",
    }:
        return True
    if risk_result.risk_level in (RiskLevel.MEDIUM, RiskLevel.HIGH):
        return True
    return False


SCENARIO_MAP = {
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


def run_clip(audio_path: Path, sector: str, scenario_raw: str, label: str,
             expected: str, xgb_model, dual_classifier) -> ClipResult:
    audio = _load_audio(audio_path)
    vad = VoiceActivityDetector()
    accumulator = WindowAccumulator()

    policy_scenario = SCENARIO_MAP[sector].get(scenario_raw, "routine_support")
    txn_amt = None
    if policy_scenario == "high_value_transaction":
        txn_amt = 600_000.0
    elif policy_scenario == "vip_booking":
        txn_amt = 200_000.0

    sm = StreamManager()
    sm.configure_stream(
        stream_id="validation",
        scenario=policy_scenario,
        transaction_amount_inr=txn_amt,
        sector=sector,
    )

    max_xgb = 0.0
    max_dual: Optional[float] = None
    max_ensemble = 0.0
    max_rolling = 0.0
    n_high = 0
    alert_overall = False
    notif_overall = False
    gov_action_overall: Optional[str] = None
    final_level = RiskLevel.LOW

    frames = _split_into_vad_frames(audio)
    window_id = 0
    for frame in frames:
        if not vad.is_speech(frame):
            continue
        windows = accumulator.push(frame)
        for audio_window in windows:
            speech_in_window = any(
                vad.is_speech(audio_window[i : i + VAD_FRAME_SAMPLES])
                for i in range(0, len(audio_window), VAD_FRAME_SAMPLES)
                if len(audio_window[i : i + VAD_FRAME_SAMPLES]) == VAD_FRAME_SAMPLES
            )
            if not speech_in_window:
                continue
            window_id += 1

            raw = extract_features(audio_window).reshape(1, -1)
            xgb_prob = float(np.clip(xgb_model.predict_proba(raw)[0, 1], 0, 1))

            dual_prob: Optional[float] = None
            if dual_classifier is not None:
                try:
                    res = dual_classifier.predict(audio_window)
                    cand = res.get("ai_probability")
                    if cand is not None and math.isfinite(float(cand)):
                        dual_prob = float(np.clip(cand, 0.0, 1.0))
                except Exception:
                    pass

            ensemble_prob = fuse_acoustic_probabilities(
                xgb_probability=xgb_prob,
                dual_probability=dual_prob,
            )
            prediction = ModelPrediction(
                stream_id="validation",
                window_id=window_id,
                timestamp=time.time(),
                ai_probability=ensemble_prob,
                model_version="ensemble-xgb-mms300m-v1",
            )
            risk_result = sm.update(prediction)
            final_level = risk_result.risk_level

            notif = _notification_evaluator(risk_result, policy_scenario)

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

            gov = evaluate_sector_result(
                rdict,
                sector=sector,
                scenario=scenario_raw,
                transaction_amount_inr=txn_amt,
                caller_id=None,
            )
            if gov:
                gov_action_overall = gov.get("action")

            if risk_result.risk_level == RiskLevel.HIGH:
                n_high += 1
            if risk_result.alert_triggered:
                alert_overall = True
            if notif:
                notif_overall = True

            max_xgb = max(max_xgb, xgb_prob)
            if dual_prob is not None:
                max_dual = dual_prob if max_dual is None else max(max_dual, dual_prob)
            max_ensemble = max(max_ensemble, ensemble_prob)
            max_rolling = max(max_rolling, risk_result.rolling_score)

    frontend = _frontend_accepts(
        risk_result=type("R", (), {
            "alert_triggered": alert_overall,
            "risk_level": final_level,
        })(),
        notification_triggered=notif_overall,
        governance_decision={"action": gov_action_overall} if gov_action_overall else None,
    )

    return ClipResult(
        label=label,
        expected=expected,
        sector=sector,
        scenario=scenario_raw,
        n_windows=window_id,
        max_xgb=max_xgb,
        max_dual=max_dual,
        max_ensemble=max_ensemble,
        max_rolling=max_rolling,
        n_high_windows=n_high,
        alert_triggered=alert_overall,
        notification_triggered=notif_overall,
        frontend_accepted=frontend,
        governance_action=gov_action_overall,
        final_risk_level=final_level,
    )


# All sector clips under test.
SECTOR_CLIPS = [
    # Spoof clips.
    ("retail", "retail_spoof_address_change_hi.wav", "spoof", "order_modification"),
    ("retail", "retail_spoof_refund_redirect_ta.wav", "spoof", "order_modification"),
    ("hospitality", "hospitality_spoof_vip_folio_ta.wav", "spoof", "vip_booking"),
    ("hospitality", "hospitality_spoof_suite_cancel_hi.wav", "spoof", "reservation_change"),
    ("entertainment", "entertainment_spoof_celebrity_dub_hi.wav", "spoof", "dubbing_verification"),
    ("entertainment", "entertainment_spoof_artist_clone_ta.wav", "spoof", "voice_authenticity"),
    ("finance", "finance_spoof_rtgs_transfer_hi.wav", "spoof", "high_value_transfer"),
    ("finance", "finance_spoof_account_recovery_hi.wav", "spoof", "account_recovery"),
    # Bonafide clips.
    ("retail", "retail_bonafide_inquiry_en.wav", "bonafide", "customer_care"),
    ("hospitality", "hospitality_bonafide_reservation_en.wav", "bonafide", "guest_verification"),
    ("entertainment", "entertainment_bonafide_studio_stem_en.wav", "bonafide", "dubbing_verification"),
    ("finance", "finance_bonafide_balance_inquiry_en.wav", "bonafide", "customer_verification"),
]


@pytest.fixture(scope="module")
def xgb_model():
    if not MODEL_PATH.exists():
        pytest.skip(f"Production XGBoost model missing: {MODEL_PATH}")
    return joblib.load(MODEL_PATH)


@pytest.fixture(scope="module")
def dual_classifier():
    return _load_dual_or_none()


@pytest.mark.parametrize(
    "sector,filename,expected,scenario_raw",
    SECTOR_CLIPS,
    ids=[f"{s}__{f}" for s, f, _, _ in SECTOR_CLIPS],
)
def test_sector_clip_runs_through_pipeline(
    sector, filename, expected, scenario_raw, xgb_model, dual_classifier,
):
    """Every sector clip must run cleanly through the production
    pipeline and produce telemetry. This is the smoke test."""
    clip_path = ROOT / "data" / "sectors" / sector / expected / filename
    if not clip_path.exists():
        pytest.skip(f"Missing clip: {clip_path}")
    result = run_clip(
        clip_path,
        sector=sector,
        scenario_raw=scenario_raw,
        label=filename,
        expected=expected,
        xgb_model=xgb_model,
        dual_classifier=dual_classifier,
    )
    assert result.n_windows >= 1
    assert 0.0 <= result.max_xgb <= 1.0
    assert 0.0 <= result.max_ensemble <= 1.0
    assert 0.0 <= result.max_rolling <= 1.0


# ----------------------------------------------------------------------
# Acceptance criteria
# ----------------------------------------------------------------------


def test_finance_rtgs_spoof_alerts_or_reaches_medium(
    xgb_model, dual_classifier,
):
    """finance_spoof_rtgs_transfer_hi.wav was the canonical regression:
    baseline 0.5/0.5 average collapsed the XGB's spoof signal because
    the bimodal dual returned 0.624 there. The fix must surface this
    spoof either as a HIGH alert or as a frontend-accepted MEDIUM.
    """
    result = run_clip(
        ROOT / "data" / "sectors" / "finance" / "spoof" / "finance_spoof_rtgs_transfer_hi.wav",
        sector="finance",
        scenario_raw="high_value_transfer",
        label="finance_spoof_rtgs_transfer_hi.wav",
        expected="spoof",
        xgb_model=xgb_model,
        dual_classifier=dual_classifier,
    )
    assert result.frontend_accepted, (
        f"finance_spoof_rtgs_transfer_hi.wav must be surfaced to the "
        f"dashboard. Got alert={result.alert_triggered}, "
        f"frontend={result.frontend_accepted}, max_rolling={result.max_rolling:.3f}, "
        f"max_ensemble={result.max_ensemble:.3f}"
    )


def test_entertainment_celebrity_dub_spoof_accepted(
    xgb_model, dual_classifier,
):
    """entertainment_spoof_celebrity_dub_hi.wav was the second canonical
    regression: XGB peak 0.809 was suppressed by dual=0.635 to a 0.5/0.5
    average of 0.722. The fix must surface this spoof via either the
    risk engine or the sector governance layer."""
    result = run_clip(
        ROOT / "data" / "sectors" / "entertainment" / "spoof" / "entertainment_spoof_celebrity_dub_hi.wav",
        sector="entertainment",
        scenario_raw="dubbing_verification",
        label="entertainment_spoof_celebrity_dub_hi.wav",
        expected="spoof",
        xgb_model=xgb_model,
        dual_classifier=dual_classifier,
    )
    assert result.frontend_accepted, (
        f"entertainment_spoof_celebrity_dub_hi.wav must be surfaced to "
        f"the dashboard. Got alert={result.alert_triggered}, "
        f"frontend={result.frontend_accepted}, max_rolling={result.max_rolling:.3f}, "
        f"max_ensemble={result.max_ensemble:.3f}"
    )


def test_hospitality_bonafide_stays_quiet(xgb_model, dual_classifier):
    """hospitality_bonafide_reservation_en.wav must NOT trigger HIGH or
    alert. If the fix makes this bonafide alert, it is regressing the
    detector's specificity on edge-TTS bonafide."""
    result = run_clip(
        ROOT / "data" / "sectors" / "hospitality" / "bonafide" / "hospitality_bonafide_reservation_en.wav",
        sector="hospitality",
        scenario_raw="guest_verification",
        label="hospitality_bonafide_reservation_en.wav",
        expected="bonafide",
        xgb_model=xgb_model,
        dual_classifier=dual_classifier,
    )
    assert not result.alert_triggered, (
        f"hospitality_bonafide_reservation_en.wav must NOT alert. "
        f"Got alert={result.alert_triggered}, max_rolling={result.max_rolling:.3f}"
    )


def test_finance_bonafide_stays_quiet(xgb_model, dual_classifier):
    """finance_bonafide_balance_inquiry_en.wav must NOT trigger HIGH or
    alert. The temporal anti-correlation between XGB and dual peaks in
    this clip is what keeps it quiet and must be preserved."""
    result = run_clip(
        ROOT / "data" / "sectors" / "finance" / "bonafide" / "finance_bonafide_balance_inquiry_en.wav",
        sector="finance",
        scenario_raw="customer_verification",
        label="finance_bonafide_balance_inquiry_en.wav",
        expected="bonafide",
        xgb_model=xgb_model,
        dual_classifier=dual_classifier,
    )
    assert not result.alert_triggered, (
        f"finance_bonafide_balance_inquiry_en.wav must NOT alert. "
        f"Got alert={result.alert_triggered}, max_rolling={result.max_rolling:.3f}"
    )


def test_sector_pipeline_completion_rate(xgb_model, dual_classifier):
    """End-to-end pipeline must complete on every sector clip and
    produce at least one window of telemetry."""
    completed = 0
    for sector, filename, expected, scenario_raw in SECTOR_CLIPS:
        clip_path = ROOT / "data" / "sectors" / sector / expected / filename
        if not clip_path.exists():
            continue
        result = run_clip(
            clip_path,
            sector=sector,
            scenario_raw=scenario_raw,
            label=filename,
            expected=expected,
            xgb_model=xgb_model,
            dual_classifier=dual_classifier,
        )
        if result.n_windows >= 1:
            completed += 1
    assert completed == len(SECTOR_CLIPS), (
        f"Only {completed}/{len(SECTOR_CLIPS)} sector clips completed "
        f"the pipeline"
    )


# ----------------------------------------------------------------------
# Optional demo file tests
# ----------------------------------------------------------------------


def _demo_paths():
    """Locate the optional demo files referenced by the bug report.
    These may not exist in this checkout (they were external test
    artifacts); we skip gracefully if absent."""
    demo_dir = ROOT / "demo"
    return [
        demo_dir / "cloned_voice.wav",
        demo_dir / "TTSOL-en-US-BrianMultilingual-20260915-074841.wav",
        demo_dir / "_Welcome to Echoes o.wav",
    ]


@pytest.mark.parametrize(
    "demo_path",
    _demo_paths(),
    ids=lambda p: p.name,
)
def test_demo_file_continues_to_alert(demo_path, xgb_model, dual_classifier):
    """The bug report states that these demo files (when present) were
    detected correctly through the current /ws/audio pipeline before
    the fix. The fix must NOT regress that behavior. If a file is
    absent in this checkout the test is skipped, not failed."""
    if not demo_path.exists():
        pytest.skip(f"Demo file not present in checkout: {demo_path}")

    result = run_clip(
        demo_path,
        sector="generic_demo",
        scenario_raw="routine_support",
        label=demo_path.name,
        expected="spoof",
        xgb_model=xgb_model,
        dual_classifier=dual_classifier,
    )
    assert result.frontend_accepted, (
        f"{demo_path.name} must still be surfaced to the dashboard. "
        f"Got alert={result.alert_triggered}, frontend={result.frontend_accepted}"
    )
