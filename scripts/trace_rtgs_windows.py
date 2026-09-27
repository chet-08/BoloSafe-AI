"""
Trace RTGS Spoof Audio Window-by-Window
Compares:
AI_ens -> rolling_score -> flags -> RiskEngine risk_level -> alert_triggered -> Finance governance decision
"""

import os
import sys
import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.config import SAMPLE_RATE, VAD_FRAME_SAMPLES
from src.vad import VoiceActivityDetector
from src.window_accumulator import WindowAccumulator
from src.websocket.server import process_audio_window, dual_stream_classifier
from src.risk_engine.stream_manager import StreamManager
from src.risk_engine.notification_engine import NotificationEngine
from src.risk_engine.schemas import ModelPrediction
from src.sectors.common.governance import evaluate_sector_result

AUDIO_FILE = "data/sectors/finance/spoof/finance_spoof_rtgs_transfer_hi.wav"
STREAM_ID = "trace_rtgs_eval_001"
SCENARIO = "high_value_transfer"
SECTOR = "finance"
TX_AMOUNT = 5000000.0  # 50 Lakh INR RTGS transaction


def main():
    print("=" * 80)
    print(f"Tracing RTGS Spoof Window-by-Window: {AUDIO_FILE}")
    print("=" * 80)

    if not os.path.exists(AUDIO_FILE):
        print(f"ERROR: Audio file not found: {AUDIO_FILE}")
        return

    data, sr = sf.read(AUDIO_FILE, dtype="float32")
    if data.ndim > 1:
        data = np.mean(data, axis=1)

    print(f"Audio loaded: {len(data)} samples ({len(data)/sr:.2f}s) at {sr}Hz")

    # Initialize components exactly as in WebSocket server
    vad = VoiceActivityDetector()
    accumulator = WindowAccumulator()
    stream_manager = StreamManager()
    notification_engine = NotificationEngine()

    stream_manager.configure_stream(
        STREAM_ID,
        SCENARIO,
        TX_AMOUNT,
        SECTOR,
    )

    windows = []
    # Feed frames to VAD and Accumulator
    for start in range(0, len(data), VAD_FRAME_SAMPLES):
        frame = data[start : start + VAD_FRAME_SAMPLES]
        if len(frame) < VAD_FRAME_SAMPLES:
            continue
        if vad.is_speech(frame):
            completed = accumulator.push(frame)
            windows.extend(completed)

    print(f"Total valid speech windows accumulated: {len(windows)}\n")

    print(f"{'Win#':<5} | {'AI_ens':<7} | {'Rolling':<7} | {'Flags':<5} | {'RiskEngine':<10} | {'Alert':<5} | {'Composite':<9} | {'Gov Action':<18} | {'Gov Risk':<8}")
    print("-" * 90)

    window_id = 0
    for audio_window in windows:
        # Check silence
        speech_detected = False
        for vad_start in range(0, len(audio_window), VAD_FRAME_SAMPLES):
            vad_frame = audio_window[vad_start : vad_start + VAD_FRAME_SAMPLES]
            if len(vad_frame) == VAD_FRAME_SAMPLES and vad.is_speech(vad_frame):
                speech_detected = True
                break

        if not speech_detected:
            continue

        window_id += 1
        audio_window = np.asarray(audio_window, dtype=np.float32).reshape(-1)

        # Feature extraction & model inference
        ai_prob, latency_ms, features = process_audio_window(audio_window)
        xgb_prob = ai_prob

        # Dual stream if active
        if dual_stream_classifier is not None and (ai_prob >= 0.40 or window_id % 4 == 0):
            try:
                ds_res = dual_stream_classifier.predict(audio_window, sr=SAMPLE_RATE)
                if ds_res and "ai_probability" in ds_res:
                    dual_prob = float(ds_res["ai_probability"])
                    ensemble_prob = float(np.clip(0.5 * xgb_prob + 0.5 * dual_prob, 0.0, 1.0))
                else:
                    ensemble_prob = xgb_prob
            except Exception:
                ensemble_prob = xgb_prob
        else:
            ensemble_prob = xgb_prob

        # Update RiskEngine
        prediction = ModelPrediction(
            stream_id=STREAM_ID,
            window_id=window_id,
            timestamp=1000.0 + window_id * 0.5,
            ai_probability=ensemble_prob,
            model_version="ensemble-xgb-mms300m-v1",
        )
        result = stream_manager.update(prediction)

        # Notification engine
        notification = notification_engine.evaluate(
            scenario=SCENARIO,
            risk_score=result.rolling_score,
            alert_triggered=result.alert_triggered,
        )

        # Unified Sector Governance
        gov_res = evaluate_sector_result(
            result.model_dump(),
            sector=SECTOR,
            scenario=SCENARIO,
            transaction_amount_inr=TX_AMOUNT,
            caller_id="CORP_CFO_001",
        )

        composite_risk = gov_res.get("composite_risk_score", 0.0)
        gov_action = gov_res.get("action", "")
        gov_risk = gov_res.get("risk_level", "")

        print(
            f"{window_id:<5} | "
            f"{ensemble_prob:<7.3f} | "
            f"{result.rolling_score:<7.3f} | "
            f"{result.consecutive_flags:<5} | "
            f"{result.risk_level.value:<10} | "
            f"{str(result.alert_triggered):<5} | "
            f"{composite_risk:<9.1f}% | "
            f"{gov_action:<18} | "
            f"{gov_risk:<8}"
        )


if __name__ == "__main__":
    main()
