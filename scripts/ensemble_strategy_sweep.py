"""
Ensemble strategy sweep.

Runs the same per-window pipeline as the live server but swaps in
different ensemble formulas. Useful for evaluating candidate fixes
without writing to disk.

Strategies:
  baseline        — current 0.5*xgb + 0.5*dual (server-faithful)
  xgb_only        — XGB canonical, dual ignored
  xgb_canonical   — XGB canonical if XGB>=HIGH_ENTER; else 0.5/0.5 ensemble
  weighted_xgb    — 0.75*xgb + 0.25*dual (XGB-preferred weighted)
  weighted_dual   — 0.25*xgb + 0.75*dual (dual-preferred weighted)
  asymmetric      — 0.3*xgb+0.7*dual when dual<0.3 (bonafide veto);
                    0.75*xgb+0.25*dual otherwise (XGB-dominant)
  confidence      — use whichever model is farther from 0.5 per window
  gate_dual       — XGB canonical; if dual<0.30 (bonafide veto), use 0.5/0.5
"""

from __future__ import annotations

import json
import sys
import time
import warnings
from pathlib import Path
from typing import List, Optional

import numpy as np

warnings.filterwarnings("ignore")

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import joblib
import librosa

from src.config import SAMPLE_RATE, VAD_FRAME_SAMPLES
from src.features import extract_features
from src.fusion import fuse_acoustic_probabilities
from src.risk_engine.engine import RiskEngine
from src.risk_engine.schemas import ModelPrediction, RiskLevel, RiskResult
from src.risk_engine.stream_manager import StreamManager
from src.sectors.common.governance import evaluate_sector_result
from src.vad import VoiceActivityDetector
from src.window_accumulator import WindowAccumulator


MODEL_PATH = ROOT / "reports" / "xgboost_58d_calibrated.joblib"


def _ensemble(strategy: str, xgb: float, dual: Optional[float]) -> float:
    dual_valid = dual is not None and np.isfinite(dual)
    if not dual_valid:
        return float(np.clip(xgb, 0.0, 1.0))

    d = float(np.clip(dual, 0.0, 1.0))
    x = float(np.clip(xgb, 0.0, 1.0))

    if strategy == "baseline":
        return float(np.clip(0.5 * x + 0.5 * d, 0.0, 1.0))
    if strategy == "xgb_only":
        return x
    if strategy == "xgb_canonical":
        return fuse_acoustic_probabilities(x, d)
    if strategy == "weighted_xgb":
        return float(np.clip(0.75 * x + 0.25 * d, 0.0, 1.0))
    if strategy == "weighted_dual":
        return float(np.clip(0.25 * x + 0.75 * d, 0.0, 1.0))
    if strategy == "asymmetric":
        if d < 0.30:
            return float(np.clip(0.3 * x + 0.7 * d, 0.0, 1.0))
        return float(np.clip(0.75 * x + 0.25 * d, 0.0, 1.0))
    if strategy == "confidence":
        cx = abs(x - 0.5)
        cd = abs(d - 0.5)
        if cx + cd < 1e-6:
            return float(np.clip(0.5 * x + 0.5 * d, 0.0, 1.0))
        wx = cx / (cx + cd)
        wd = cd / (cx + cd)
        return float(np.clip(wx * x + wd * d, 0.0, 1.0))
    if strategy == "gate_dual":
        if d < 0.30:
            return float(np.clip(0.5 * x + 0.5 * d, 0.0, 1.0))
        return x
    raise ValueError(f"Unknown strategy: {strategy}")


def _load_audio(path: Path) -> np.ndarray:
    audio, _ = librosa.load(str(path), sr=SAMPLE_RATE, mono=True)
    return audio.astype(np.float32, copy=False)


def _split_into_vad_frames(audio: np.ndarray):
    n = len(audio) // VAD_FRAME_SAMPLES
    return [audio[i * VAD_FRAME_SAMPLES : (i + 1) * VAD_FRAME_SAMPLES] for i in range(n)]


def run_clip(audio_path: Path, sector: str, scenario: str,
             xgb_model, dual_classifier, strategy: str,
             transaction_amount_inr: Optional[float] = None,
             governance_scenario: Optional[str] = None):
    audio = _load_audio(audio_path)
    vad = VoiceActivityDetector()
    accumulator = WindowAccumulator()
    sm = StreamManager()
    sm.configure_stream(
        stream_id="validation",
        scenario=scenario,
        transaction_amount_inr=transaction_amount_inr,
        sector=sector,
    )

    max_xgb = 0.0
    max_dual: Optional[float] = None
    max_ensemble = 0.0
    max_rolling = 0.0
    n_high = 0
    alert_overall = False
    last_risk = RiskLevel.LOW
    gov_action = None

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
            raw_features = extract_features(audio_window).reshape(1, -1)
            xgb_prob = float(np.clip(xgb_model.predict_proba(raw_features)[0, 1], 0, 1))

            dual_prob: Optional[float] = None
            if dual_classifier is not None:
                try:
                    res = dual_classifier.predict(audio_window)
                    cand = res.get("ai_probability")
                    if cand is not None and np.isfinite(cand):
                        dual_prob = float(np.clip(cand, 0.0, 1.0))
                except Exception:
                    pass

            ensemble_prob = _ensemble(strategy, xgb_prob, dual_prob)
            prediction = ModelPrediction(
                stream_id="validation",
                window_id=window_id,
                timestamp=time.time(),
                ai_probability=ensemble_prob,
                model_version="ensemble-xgb-mms300m-v1",
            )
            risk_result = sm.update(prediction)
            last_risk = risk_result.risk_level
            if risk_result.risk_level == RiskLevel.HIGH:
                n_high += 1
            if risk_result.alert_triggered:
                alert_overall = True
            max_xgb = max(max_xgb, xgb_prob)
            if dual_prob is not None:
                max_dual = dual_prob if max_dual is None else max(max_dual, dual_prob)
            max_ensemble = max(max_ensemble, ensemble_prob)
            max_rolling = max(max_rolling, risk_result.rolling_score)

            # Governance using current per-window stats.
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
                scenario=governance_scenario or scenario,
                transaction_amount_inr=transaction_amount_inr,
                caller_id=None,
            )
            if gov:
                gov_action = gov.get("action")

    frontend_accepted = (
        alert_overall
        or last_risk in (RiskLevel.MEDIUM, RiskLevel.HIGH)
        or (gov_action in {
            "hold_and_escalate",
            "block_rights_and_escalate",
            "lock_folio_and_escalate",
        })
    )

    return {
        "n_windows": window_id,
        "max_xgb": max_xgb,
        "max_dual": max_dual,
        "max_ensemble": max_ensemble,
        "max_rolling": max_rolling,
        "n_high_windows": n_high,
        "alert_triggered": alert_overall,
        "frontend_accepted": frontend_accepted,
        "governance_action": gov_action,
        "last_risk_level": last_risk.value,
    }


def load_dual():
    try:
        from src.models.fused_acoustic_model import DualStreamFusionClassifier
        clf = DualStreamFusionClassifier()
        if clf.model is None:
            return None
        return clf
    except Exception:
        return None


def main():
    xgb = joblib.load(MODEL_PATH)
    dual = load_dual()

    manifest_csv = ROOT / "reports" / "sector_manifest.csv"
    import csv

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

    rows = []
    with open(manifest_csv, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            clip_path = ROOT / row["file_path"]
            if not clip_path.exists():
                continue
            sector = row["sector"]
            scenario_raw = row["scenario"]
            scenario = scenario_map[sector].get(scenario_raw, "routine_support")
            txn_amt = None
            if scenario == "high_value_transaction":
                txn_amt = 600_000.0
            elif scenario == "vip_booking":
                txn_amt = 200_000.0
            row_data = dict(row)
            row_data["xgb_model"] = xgb
            row_data["dual_classifier"] = dual
            row_data["policy_scenario"] = scenario
            row_data["governance_scenario"] = scenario_raw
            row_data["transaction_amount_inr"] = txn_amt
            row_data["clip_path"] = clip_path
            rows.append(row_data)

    strategies = [
        "baseline",
        "xgb_only",
        "xgb_canonical",
        "weighted_xgb",
        "weighted_dual",
        "asymmetric",
        "confidence",
        "gate_dual",
    ]

    results = {s: [] for s in strategies}
    for row in rows:
        print(f"\n=== {row['filename']} ({row['label']}, sector={row['sector']}) ===")
        for strat in strategies:
            r = run_clip(
                row["clip_path"],
                sector=row["sector"],
                scenario=row["policy_scenario"],
                governance_scenario=row["governance_scenario"],
                xgb_model=row["xgb_model"],
                dual_classifier=row["dual_classifier"],
                strategy=strat,
                transaction_amount_inr=row["transaction_amount_inr"],
            )
            r["label"] = row["filename"]
            r["expected"] = row["label"]
            results[strat].append(r)
            print(
                f"  {strat:18}  ens={r['max_ensemble']:.3f}  "
                f"roll={r['max_rolling']:.3f}  "
                f"hi={r['n_high_windows']:2d}  "
                f"alert={str(r['alert_triggered']):5}  "
                f"fe={str(r['frontend_accepted']):5}  "
                f"gov={r['governance_action']}  "
                f"lvl={r['last_risk_level']}"
            )

    # Summary table per strategy: spoof recall, bonafide FP, frontend_accepted accuracy.
    print("\n" + "=" * 100)
    print(f"{'strategy':20} {'spoof_alert':>12} {'spoof_frontend':>15} {'bonafide_alert':>15} {'bonafide_frontend':>20}")
    for strat in strategies:
        spoof = [r for r in results[strat] if r["expected"] == "spoof"]
        bona = [r for r in results[strat] if r["expected"] == "bonafide"]
        spoof_alert = sum(1 for r in spoof if r["alert_triggered"])
        spoof_fe = sum(1 for r in spoof if r["frontend_accepted"])
        bona_alert = sum(1 for r in bona if r["alert_triggered"])
        bona_fe = sum(1 for r in bona if r["frontend_accepted"])
        print(
            f"{strat:20} {spoof_alert}/{len(spoof):>2}            "
            f"{spoof_fe:>2}/{len(spoof):>2}             "
            f"{bona_alert:>2}/{len(bona):>2}              "
            f"{bona_fe:>2}/{len(bona):>2}"
        )

    out = ROOT / "reports" / "strategy_sweep.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\n[diag] Wrote {out}")


if __name__ == "__main__":
    main()
