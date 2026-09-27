import os

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")

from dotenv import load_dotenv

load_dotenv()

import asyncio
import atexit
from concurrent.futures import ThreadPoolExecutor
import json
import os
import time
import tempfile

import joblib
import numpy as np
import librosa
import pandas as pd
import soundfile as sf
import librosa


import os
import tempfile
import soundfile as sf
import librosa
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from src.models.fused_acoustic_model import DualStreamFusionClassifier

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File

from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from src.adversarial.router import router as adversarial_router
from src.sectors.api import router as sector_api_router
from src.config import VAD_FRAME_SAMPLES, SAMPLE_RATE
from src.features import extract_features
from src.yin_analyzer import extract_yin_pitch_stats
from src.models.fused_acoustic_model import DualStreamFusionClassifier
from src.risk_engine.schemas import ModelPrediction, ProsodyAnalysis
from src.risk_engine.stream_manager import StreamManager
from src.vad import VoiceActivityDetector
from src.window_accumulator import WindowAccumulator

from src.file_loader import load_audio_file

# --- Sprint 1B additions ---
from src.risk_engine.prosody_buffer import (
    ProsodyBuffer,
    FullStreamProsodyAccumulator,
)
from src.risk_engine.shap_engine import ShapEngine
from src.risk_engine.notification_engine import NotificationEngine
from src.risk_engine.dispatch.base import DispatchMessage
from src.risk_engine.dispatch.service import DispatchService
from src.privacy_policy import assert_zero_retention
from src.speaker_registry import (
    SpeakerRegistry,
    UnknownSpeakerError,
    parse_speaker_id_from_query,
)
from src.transcription import StreamingTranscriber
from src.sectors.common.governance import evaluate_sector_result


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(adversarial_router)
app.include_router(sector_api_router, prefix="/api/v1/sectors")



# ============================================================================
# MODEL CONFIGURATION
# ============================================================================

MODEL_PATH = "reports/xgboost_58d_calibrated.joblib"
MODEL_VERSION = "sprint2b-xgb-58d-calibrated"
EXPECTED_FEATURES = 58

model = joblib.load(MODEL_PATH)

# Single-sample real-time inference is slightly faster with one worker.
# Avoids thread-pool overhead from n_jobs=-1.
if hasattr(model, "calibrated_classifiers_"):
    for calibrated in model.calibrated_classifiers_:
        estimator = getattr(calibrated, "estimator", None)
        if estimator is not None and hasattr(estimator, "set_params"):
            estimator.set_params(n_jobs=1)

if hasattr(model, "estimator"):
    try:
        model.estimator.set_params(n_jobs=1)
    except Exception:
        pass

print("[xgboost] Real-time inference configured with n_jobs=1")

# Supporting prosody model.
# This NEVER replaces the primary XGBoost detector.
PROSODY_MODEL_PATH = "reports/prosody_hgb_acoustic_calibrated.joblib"
prosody_artifact = joblib.load(PROSODY_MODEL_PATH)
prosody_model = prosody_artifact["model"]
PROSODY_MODEL_VERSION = prosody_artifact["model_version"]

# Feature extraction + model inference SLA.
# This does NOT include VAD or window accumulation time.
E2E_SLA_MS = 15.0

shap_engine = ShapEngine()
notification_engine = NotificationEngine()
dispatch_service = DispatchService()
speaker_registry = SpeakerRegistry()

# Trilingual Dual-Stream Neural Acoustic Fusion Engine (MMS-300M + 58D DSP)
try:
    dual_stream_classifier = DualStreamFusionClassifier()
    print("[dual-stream] Trilingual MMS-300M + 58D Acoustic Fusion model active.")
except Exception as exc:
    print(f"[dual-stream] Model load deferred or unavailable: {exc}")
    dual_stream_classifier = None


# One ProsodyBuffer per active stream.
prosody_buffers: dict[str, ProsodyBuffer] = {}
full_prosody_accumulators: dict[str, FullStreamProsodyAccumulator] = {}


def get_prosody_buffer(stream_id: str) -> ProsodyBuffer:
    if stream_id not in prosody_buffers:
        prosody_buffers[stream_id] = ProsodyBuffer()

    return prosody_buffers[stream_id]


def get_full_prosody_accumulator(
    stream_id: str,
) -> FullStreamProsodyAccumulator:
    if stream_id not in full_prosody_accumulators:
        full_prosody_accumulators[stream_id] = (
            FullStreamProsodyAccumulator()
        )

    return full_prosody_accumulators[stream_id]


def calculate_corrected_pitch_change_rate(
    audio_window: np.ndarray,
    sr: int = SAMPLE_RATE,
) -> float:
    """
    Calculate pitch-change rate using only adjacent valid F0 frames.

    This intentionally does not bridge across unvoiced/invalid frames.
    The production XGBoost feature extractor is untouched.
    """

    try:
        import librosa

        y = np.asarray(
            audio_window,
            dtype=np.float32,
        ).reshape(-1)

        if y.size == 0:
            return 0.0

        f0 = librosa.yin(
            y,
            fmin=65.0,
            fmax=400.0,
            sr=sr,
            frame_length=1024,
            hop_length=512,
        )

        if len(f0) < 2:
            return 0.0

        previous = f0[:-1]
        current = f0[1:]

        valid = (
            np.isfinite(previous)
            & np.isfinite(current)
            & (previous > 0)
            & (current > 0)
        )

        if not np.any(valid):
            return 0.0

        changes = (
            np.abs(
                current[valid] - previous[valid]
            )
            / previous[valid]
        )

        return float(np.mean(changes))

    except Exception as exc:
        print(
            f"[prosody] "
            f"pitch change calculation failed: {exc}"
        )
        return 0.0


async def transcribe_snapshot_and_send(
    websocket: WebSocket,
    stream_id: str,
    stt_stream: StreamingTranscriber,
    snapshot: tuple[np.ndarray, int],
    is_final: bool = False,
) -> None:
    """Run Whisper on an immutable audio snapshot and send it to the UI."""

    try:
        audio, start_sample = snapshot

        result = await asyncio.to_thread(
            stt_stream.transcribe_snapshot,
            audio,
            start_sample,
            is_final,
        )

        # Do not emit empty intermediate Whisper snapshots.
        # This keeps the STT stream transparent to existing
        # RiskResult/WebSocket consumers while still allowing
        # a final empty snapshot to be followed by transcript_complete.
        if not result.text.strip() and not result.segments and not is_final:
            return

        await websocket.send_json(
            {
                "type": "transcript_snapshot",
                "stream_id": stream_id,
                "timestamp": time.time(),
                "language": result.language,
                "audio_start": result.audio_start,
                "audio_end": result.audio_end,
                "text": result.text,
                "segments": [
                    {
                        "start": segment.start,
                        "end": segment.end,
                        "text": segment.text,
                        "language": segment.language,
                    }
                    for segment in result.segments
                ],
                "is_final": result.is_final,
            }
        )

    except Exception as exc:
        print(
            f"[stt] Snapshot transcription failed "
            f"stream={stream_id}: {exc}"
        )


# ============================================================================
# MODEL VALIDATION / STARTUP LOGGING
# ============================================================================

print("=" * 70)
print("[model] Loaded:", MODEL_PATH)
print("[model] Version:", MODEL_VERSION)
print("[model] Type:", type(model).__name__)
print("[prosody] Loaded:", PROSODY_MODEL_PATH)
print("[prosody] Version:", PROSODY_MODEL_VERSION)

if hasattr(model, "n_features_in_"):
    print("[model] Expected features:", model.n_features_in_)

if hasattr(model, "named_steps"):
    print("[model] Pipeline steps:", list(model.named_steps.keys()))

print("=" * 70)


# ============================================================================
# SHARED RISK ENGINE STATE
# ============================================================================

stream_manager = StreamManager()

connected_clients: set[WebSocket] = set()

client_stream_ids: dict[WebSocket, set[str]] = {}

stream_owners: dict[str, int] = {}

PRIMARY_INFERENCE_EXECUTOR = ThreadPoolExecutor(
    max_workers=1,
    thread_name_prefix="primary-inference",
)

DUAL_STREAM_EXECUTOR = ThreadPoolExecutor(
    max_workers=1,
    thread_name_prefix="dual-stream",
)


@atexit.register
def _shutdown_primary_inference_executor() -> None:
    PRIMARY_INFERENCE_EXECUTOR.shutdown(wait=False, cancel_futures=True)


@atexit.register
def _shutdown_dual_stream_executor() -> None:
    DUAL_STREAM_EXECUTOR.shutdown(wait=False, cancel_futures=True)


speaker_verification_results: dict[
    str, tuple[float | None, bool | None]
] = {}

speaker_verification_tasks: dict[str, asyncio.Task] = {}

prosody_analysis_tasks: dict[str, asyncio.Task] = {}

prosody_analysis_results: dict[
    str, tuple[float | None, str, dict]
] = {}


async def _run_prosody_analysis_background(
    stream_id: str,
    window_id: int,
    audio_window: np.ndarray,
    features: np.ndarray,
) -> None:
    """Run supporting prosody ML without blocking the primary detector."""

    try:
        prosody_f0 = await asyncio.to_thread(
            extract_yin_pitch_stats,
            audio_window,
            sr=SAMPLE_RATE,
        )

        live_f0 = await asyncio.to_thread(
            librosa.yin,
            audio_window,
            fmin=65.0,
            fmax=400.0,
            sr=SAMPLE_RATE,
            frame_length=1024,
            hop_length=512,
        )

        valid_f0 = live_f0[
            np.isfinite(live_f0)
            & (live_f0 > 0)
        ]

        pitch_range = (
            float(np.max(valid_f0) - np.min(valid_f0))
            if valid_f0.size >= 2
            else 0.0
        )

        corrected_rate = await asyncio.to_thread(
            calculate_corrected_pitch_change_rate,
            audio_window,
            SAMPLE_RATE,
        )

        spectral_centroid = await asyncio.to_thread(
            librosa.feature.spectral_centroid,
            y=audio_window,
            sr=SAMPLE_RATE,
            n_fft=1024,
            hop_length=512,
        )

        spectral_bandwidth = await asyncio.to_thread(
            librosa.feature.spectral_bandwidth,
            y=audio_window,
            sr=SAMPLE_RATE,
            n_fft=1024,
            hop_length=512,
        )

        centroid_values = spectral_centroid[0]
        bandwidth_values = spectral_bandwidth[0]

        centroid_valid = centroid_values[
            np.isfinite(centroid_values)
        ]

        bandwidth_valid = bandwidth_values[
            np.isfinite(bandwidth_values)
        ]

        centroid_mean = (
            float(np.mean(centroid_valid))
            if centroid_valid.size
            else 0.0
        )

        centroid_std = (
            float(np.std(centroid_valid))
            if centroid_valid.size
            else 0.0
        )

        bandwidth_mean = (
            float(np.mean(bandwidth_valid))
            if bandwidth_valid.size
            else 0.0
        )

        bandwidth_std = (
            float(np.std(bandwidth_valid))
            if bandwidth_valid.size
            else 0.0
        )

        prosody_input = pd.DataFrame([{
            "f0_mean": (
                float(features[56])
                if np.isfinite(features[56])
                else np.nan
            ),
            "f0_std": (
                float(features[57])
                if np.isfinite(features[57])
                else np.nan
            ),
            "yin_f0_mean": prosody_f0["f0_mean"],
            "yin_f0_std": prosody_f0["f0_std"],
            "pitch_range": pitch_range,
            "pitch_change_rate_corrected": corrected_rate,
            "centroid_mean": centroid_mean,
            "centroid_std": centroid_std,
            "bandwidth_mean": bandwidth_mean,
            "bandwidth_std": bandwidth_std,
        }])

        print(
            "[prosody-ml] "
            f"background analysis window={window_id}"
        )

        prosody_probability = float(
            await asyncio.to_thread(
                lambda: prosody_model.predict_proba(
                    prosody_input
                )[0, 1]
            )
        )

        if prosody_probability >= 0.70:
            signal = "SPOOF_SUPPORT"
        elif prosody_probability < 0.30:
            signal = "BONAFIDE_SUPPORT"
        else:
            signal = "INCONCLUSIVE"

        result = {
            "yin_analysis": {
                "f0_mean": prosody_f0["f0_mean"],
                "f0_std": prosody_f0["f0_std"],
                "pitch_range": pitch_range,
                "pitch_change_rate_corrected": corrected_rate,
            },
            "prosody_probability": prosody_probability,
        }

        prosody_analysis_results[stream_id] = (
            prosody_probability,
            signal,
            result,
        )

        print(
            "[prosody-ml] "
            f"background probability={prosody_probability:.3f} "
            f"signal={signal} "
            f"window={window_id}"
        )

    except asyncio.CancelledError:
        raise

    except Exception as exc:
        print(
            "[prosody] "
            f"Background analysis failed "
            f"for window={window_id}: {exc}"
        )

    finally:
        current_task = asyncio.current_task()
        registered_task = prosody_analysis_tasks.get(stream_id)

        if registered_task is current_task:
            prosody_analysis_tasks.pop(stream_id, None)


def acquire_stream(stream_id: str) -> None:
    """Register one active connection using a stream."""

    stream_owners[stream_id] = stream_owners.get(stream_id, 0) + 1


def release_stream(stream_id: str) -> None:
    """
    Release one connection's ownership of a stream.

    Remove the Risk Engine stream only when no active
    connection is still using that stream.
    """

    owners = stream_owners.get(stream_id, 0)

    if owners <= 1:
        stream_owners.pop(stream_id, None)

        try:
            stream_manager.remove_stream(stream_id)
        except Exception as exc:
            print(
                f"[risk] Failed to remove stream "
                f"{stream_id}: {exc}"
            )

        # Cancel any outstanding background speaker verification.
        speaker_verification_results.pop(stream_id, None)

        task = speaker_verification_tasks.pop(stream_id, None)
        if task is not None and not task.done():
            task.cancel()

        # Cancel any outstanding background prosody analysis.
        prosody_analysis_results.pop(stream_id, None)

        prosody_task = prosody_analysis_tasks.pop(stream_id, None)
        if prosody_task is not None and not prosody_task.done():
            prosody_task.cancel()

        # Clean up prosody state too.
        prosody_buffers.pop(stream_id, None)
        full_prosody_accumulators.pop(stream_id, None)

    else:
        stream_owners[stream_id] = owners - 1


# ============================================================================
# HEALTH CHECK
# ============================================================================
@app.post("/api/detect/dual-stream")
async def detect_dual_stream_file(file: UploadFile = File(...)):
    """
    Dedicated endpoint for on-demand Dual-Stream analysis of an audio file.
    Supports .wav, .mp3, .ogg files.
    """
    if dual_stream_classifier is None:
        return {"error": "Dual-Stream model not available on this server"}



@app.post("/api/detect/dual-stream")
async def detect_dual_stream_file(file: UploadFile = File(...)):
    """
    Dedicated endpoint for on-demand Dual-Stream analysis of an audio file.
    Supports .wav, .mp3, .ogg files.
    """
    if dual_stream_classifier is None:
        return {"error": "Dual-Stream model not available on this server"}


    audio_bytes = await file.read()
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        audio, sr = sf.read(tmp_path)
        if audio.ndim > 1:
            audio = np.mean(audio, axis=1)
        if sr != 16000:
            audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)

        
        # Test up to first 16,000 samples (1.0s window)
        chunk = audio[:16000] if len(audio) >= 16000 else np.pad(audio, (0, 16000 - len(audio)))
        res = await asyncio.get_running_loop().run_in_executor(
            DUAL_STREAM_EXECUTOR,
            dual_stream_classifier.predict,
            chunk,
        )


        # Test up to first 16,000 samples (1.0s window)
        chunk = (
            audio[:16000]
            if len(audio) >= 16000
            else np.pad(audio, (0, 16000 - len(audio)))
        )
        res = await asyncio.get_running_loop().run_in_executor(
            DUAL_STREAM_EXECUTOR,
            dual_stream_classifier.predict,
            chunk,
        )

        res["filename"] = file.filename
        return res
    except Exception as exc:
        return {"error": f"Audio processing failed: {exc}"}
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

            




@app.get("/health")
def health_check():
    """Return backend health and model information."""

    return {
        "status": "ok",
        "model_version": MODEL_VERSION,
        "active_streams": len(stream_manager.active_streams()),
        "expected_features": EXPECTED_FEATURES,
        "vad_frame_samples": VAD_FRAME_SAMPLES,
    }


# ============================================================================
# BROADCAST RISK RESULT
# ============================================================================

async def broadcast_result(
    result,
    exclude: WebSocket | None = None,
) -> None:
    """
    Send RiskResult only to clients associated with
    the result's stream_id.
    """

    disconnected_clients: set[WebSocket] = set()

    result_stream_id = result.stream_id

    for client in list(connected_clients):

        if client is exclude:
            continue

        subscribed_streams = client_stream_ids.get(
            client,
            set(),
        )

        if result_stream_id not in subscribed_streams:
            continue

        try:
            await client.send_json(
                result.model_dump()
            )

        except Exception:
            disconnected_clients.add(client)

    for client in disconnected_clients:
        connected_clients.discard(client)
        client_stream_ids.pop(client, None)


# ============================================================================
# STANDARD MODEL-PREDICTION WEBSOCKET
# ============================================================================

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
):
    """
    Receive ModelPrediction JSON messages.

    Flow:

        ModelPrediction
            ↓
        Risk Engine
            ↓
        RiskResult
            ↓
        subscribed clients
    """

    await websocket.accept()

    scenario = websocket.query_params.get(
        "scenario",
        "routine_support",
    )

    connected_clients.add(websocket)
    client_stream_ids[websocket] = set()

    session_stream_ids = set()

    try:

        while True:

            raw_text = await websocket.receive_text()

            # ----------------------------------------------------------------
            # Parse JSON
            # ----------------------------------------------------------------

            try:
                data = json.loads(raw_text)

            except json.JSONDecodeError:

                await websocket.send_json(
                    {"error": "Malformed JSON payload"}
                )

                continue

            # ----------------------------------------------------------------
            # Validate ModelPrediction
            # ----------------------------------------------------------------

            try:
                prediction = ModelPrediction(**data)

            except ValidationError as exc:

                await websocket.send_json(
                    {
                        "error": "Invalid prediction payload",
                        "details": exc.errors(),
                    }
                )

                continue

            stream_id = prediction.stream_id

            # ----------------------------------------------------------------
            # Register stream
            # ----------------------------------------------------------------

            if stream_id not in session_stream_ids:

                stream_manager.configure_stream(
                    stream_id,
                    scenario,
                )

                session_stream_ids.add(stream_id)

                client_stream_ids[
                    websocket
                ].add(stream_id)

                acquire_stream(stream_id)

            # ----------------------------------------------------------------
            # Risk Engine
            # ----------------------------------------------------------------

            try:

                result = stream_manager.update(
                    prediction
                )

                print(
                    f"[ws] "
                    f"stream={prediction.stream_id} "
                    f"window={prediction.window_id} "
                    f"prob={prediction.ai_probability:.3f} "
                    f"rolling={result.rolling_score:.3f} "
                    f"flags={result.consecutive_flags} "
                    f"risk={result.risk_level.value} "
                    f"alert={result.alert_triggered}"
                )

            except ValueError as exc:

                await websocket.send_json(
                    {
                        "error": (
                            "Risk Engine rejected "
                            "prediction"
                        ),
                        "details": str(exc),
                    }
                )

                continue

            # ----------------------------------------------------------------
            # Send result to originating client
            # ----------------------------------------------------------------

            await websocket.send_json(
                result.model_dump()
            )

            # ----------------------------------------------------------------
            # Broadcast result
            # ----------------------------------------------------------------

            await broadcast_result(
                result,
                exclude=websocket,
            )

    except WebSocketDisconnect:

        print("[ws] Client disconnected")

    except Exception as exc:

        print(
            f"[ws] Unexpected error: {exc}"
        )

    finally:

        connected_clients.discard(websocket)

        client_stream_ids.pop(
            websocket,
            None,
        )

        for stream_id in session_stream_ids:

            release_stream(stream_id)


# ============================================================================
# PCM16 DECODER
# ============================================================================

def decode_pcm16(
    audio_bytes: bytes,
) -> np.ndarray:
    """
    Convert little-endian PCM16 bytes into float32
    samples in the range [-1, 1].
    """

    if not audio_bytes:
        return np.empty(
            0,
            dtype=np.float32,
        )

    # PCM16 must contain an even number of bytes.
    if len(audio_bytes) % 2 != 0:
        raise ValueError(
            "PCM16 payload contains an odd "
            "number of bytes"
        )

    audio = np.frombuffer(
        audio_bytes,
        dtype="<i2",
    ).astype(
        np.float32
    )

    audio /= 32768.0

    return audio


# ============================================================================
# FEATURE VALIDATION
# ============================================================================

def validate_features(
    features: np.ndarray,
) -> np.ndarray:
    """
    Validate and normalize the feature vector before
    sending it to the model.
    """

    features = np.asarray(
        features,
        dtype=np.float32,
    )

    # Flatten possible (1, 58) / (58, 1) outputs.
    features = features.reshape(-1)

    # Exact dimensionality check.
    if features.shape != (
        EXPECTED_FEATURES,
    ):
        raise ValueError(
            "Invalid feature dimension: "
            f"expected {EXPECTED_FEATURES}, "
            f"got {features.shape}"
        )

    # NaN / Inf protection.
    if not np.all(
        np.isfinite(features)
    ):
        raise ValueError(
            "Feature vector contains "
            "NaN or Inf values"
        )

    return features


# ============================================================================
# MODEL INFERENCE
# ============================================================================

def process_audio_window(
    audio_window: np.ndarray,
) -> tuple[float, float, np.ndarray]:
    """
    Extract the 58-D feature vector and run the calibrated XGBoost model.
    Returns: ai_probability, latency_ms, features.
    """

    total_start = time.perf_counter()

    audio_window = np.asarray(
        audio_window,
        dtype=np.float32,
    ).reshape(-1)

    if len(audio_window) == 0:
        raise ValueError("Received empty audio window")

    if not np.all(np.isfinite(audio_window)):
        raise ValueError("Audio window contains NaN or Inf")

    # Audio diagnostics
    diagnostics_start = time.perf_counter()

    audio_min = float(np.min(audio_window))
    audio_max = float(np.max(audio_window))
    audio_rms = float(
        np.sqrt(np.mean(np.square(audio_window)))
    )

    diagnostics_ms = (
        time.perf_counter() - diagnostics_start
    ) * 1000.0

    print(
        f"[features] samples={len(audio_window)} "
        f"min={audio_min:.4f} "
        f"max={audio_max:.4f} "
        f"rms={audio_rms:.5f}"
    )

    # 58-D feature extraction
    feature_start = time.perf_counter()

    raw_features = extract_features(
        audio_window
    )

    features = validate_features(
        raw_features
    )

    feature_ms = (
        time.perf_counter() - feature_start
    ) * 1000.0

    # Feature diagnostics
    feature_diag_start = time.perf_counter()

    feature_min = float(np.min(features))
    feature_max = float(np.max(features))
    feature_mean = float(np.mean(features))
    feature_std = float(np.std(features))

    feature_diag_ms = (
        time.perf_counter() - feature_diag_start
    ) * 1000.0

    print(
        f"[features] dim={features.shape[0]} "
        f"min={feature_min:.4f} "
        f"max={feature_max:.4f} "
        f"mean={feature_mean:.4f} "
        f"std={feature_std:.4f}"
    )

    if hasattr(model, "n_features_in_"):
        if model.n_features_in_ != EXPECTED_FEATURES:
            raise ValueError(
                f"Model expects {model.n_features_in_} features "
                f"but server expects {EXPECTED_FEATURES}"
            )

    # XGBoost
    xgb_start = time.perf_counter()

    probability_array = model.predict_proba(
        features.reshape(1, -1)
    )

    if probability_array.shape[1] < 2:
        raise ValueError(
            "Model does not provide binary class probabilities"
        )

    ai_probability = float(
        probability_array[0, 1]
    )

    if not np.isfinite(ai_probability):
        raise ValueError(
            "Model returned NaN/Inf probability"
        )

    ai_probability = float(
        np.clip(ai_probability, 0.0, 1.0)
    )

    xgb_ms = (
        time.perf_counter() - xgb_start
    ) * 1000.0

    total_ms = (
        time.perf_counter() - total_start
    ) * 1000.0

    print(
        f"[latency] "
        f"features={feature_ms:.2f}ms "
        f"feature_diag={feature_diag_ms:.2f}ms "
        f"xgb={xgb_ms:.2f}ms "
        f"audio_diag={diagnostics_ms:.2f}ms "
        f"total={total_ms:.2f}ms"
    )

    return (
        ai_probability,
        total_ms,
        features,
    )

def extract_prosody_features_only(
    audio_window: np.ndarray,
) -> np.ndarray:
    """
    Extract and validate the standard feature vector without running
    the primary XGBoost detector.

    This is used after the live synthetic-voice alert has latched so
    the remaining audio can still contribute to full-stream prosody
    statistics without continuing primary model inference.
    """
    audio_window = np.asarray(
        audio_window,
        dtype=np.float32,
    ).reshape(-1)

    if len(audio_window) == 0:
        raise ValueError(
            "Received empty audio window"
        )

    if not np.all(
        np.isfinite(audio_window)
    ):
        raise ValueError(
            "Audio window contains NaN or Inf"
        )

    raw_features = extract_features(
        audio_window
    )

    return validate_features(
        raw_features
    )


# ============================================================================
# STARTUP WARM-UP PASS
#
# Exercise the real acoustic path once at startup so librosa pitch tracking,
# MFCC/chroma transforms, VAD, and calibrated XGBoost are all warmed before
# the first live audio window.
# ============================================================================
try:
    _warmup_t = np.arange(16000, dtype=np.float32) / SAMPLE_RATE

    # Speech-like deterministic signal with voiced and harmonic components.
    _warmup_samples = (
        0.10 * np.sin(2.0 * np.pi * 180.0 * _warmup_t)
        + 0.05 * np.sin(2.0 * np.pi * 360.0 * _warmup_t)
        + 0.025 * np.sin(2.0 * np.pi * 540.0 * _warmup_t)
    ).astype(np.float32)

    _, _warmup_lat, _ = process_audio_window(_warmup_samples)

    print(
        f"[model] Acoustic pipeline warm-up finished "
        f"({_warmup_lat:.1f}ms) — ready for <{E2E_SLA_MS}ms SLA."
    )
except Exception as _warmup_exc:
    print(f"[model] Startup warm-up deferred: {_warmup_exc}")


# ============================================================================
# LIVE AUDIO WEBSOCKET
# ============================================================================

@app.websocket("/ws/audio")
async def audio_websocket_endpoint(
    websocket: WebSocket,
):
    """
    Receive live microphone audio as PCM16 mono
    16 kHz bytes.

    Flow:

        Browser microphone
            ↓
        PCM16 audio
            ↓
        VAD
            ↓
        speech frames
            ↓
        WindowAccumulator
            ↓
        58-D features
            ↓
        calibrated XGBoost
            ↓
        ModelPrediction
            ↓
        Risk Engine
            ↓
        RiskResult
            ↓
        Prosody / speaker / SHAP diagnostics
            ↓
        Browser dashboard
    """

    await websocket.accept()

    try:
        assert_zero_retention()
    except RuntimeError as exc:
        await websocket.close(code=1011, reason=str(exc))
        return

    stream_id = websocket.query_params.get(
        "stream_id",
        "browser_mic_001",
    )

    # Optional speaker verification.
    speaker_id = parse_speaker_id_from_query(
        websocket
    )
    speaker_verifier = None

    requested_scenario = websocket.query_params.get(
        "scenario",
        "routine_support",
    )

    scenario = requested_scenario
    transaction_amount_inr = None
    scenario_source = (
        "explicit"
        if websocket.query_params.get("scenario")
        else "default"
    )
    context_configured = False

    acquire_stream(stream_id)

    vad = VoiceActivityDetector()

    accumulator = WindowAccumulator()

    # Independent continuous audio buffer for transcription.
    # This is intentionally separate from the detector's VAD windows.
    stt_stream = StreamingTranscriber(
        sample_rate=SAMPLE_RATE,
        update_seconds=2.0,
        context_seconds=12.0,
    )

    prosody_buffer = get_prosody_buffer(
        stream_id
    )

    full_prosody = get_full_prosody_accumulator(
        stream_id
    )

    window_id = 0

    # Once the synthetic-voice alert fires, freeze the live
    # detection/dashboard path. The audio stream itself continues
    # only so full-stream prosody can finish accumulating.
    alert_latched = False


    # Holds incomplete VAD frame samples between
    # WebSocket packets.
    audio_remainder = np.empty(
        0,
        dtype=np.float32,
    )

    # Absolute source-sample position for the independent STT stream.
    total_input_samples = 0

    print(
        f"[audio] Client connected: "
        f"stream_id={stream_id} "
        f"speaker_id={speaker_id}"
    )

    print(
        f"[audio] VAD_FRAME_SAMPLES="
        f"{VAD_FRAME_SAMPLES}"
    )

    try:

        while True:

            message = await websocket.receive()

            # ----------------------------------------------------------------
            # Disconnect
            # ----------------------------------------------------------------

            if (
                message.get("type")
                == "websocket.disconnect"
            ):

                print(
                    f"[audio] Client disconnected: "
                    f"stream_id={stream_id}"
                )

                break

            # ----------------------------------------------------------------
            # Session context / binary audio
            # ----------------------------------------------------------------

            if "text" in message and message.get("text") is not None:
                try:
                    context = json.loads(message["text"])
                except json.JSONDecodeError:
                    await websocket.send_json(
                        {
                            "error": "Malformed session context JSON"
                        }
                    )
                    continue

                if context.get("type") == "audio_end":
                    print(
                        f"[audio] End of audio stream received: "
                        f"stream_id={stream_id}"
                    )
                    await websocket.send_json(
                        {
                            "type": "audio_end_ack",
                            "stream_id": stream_id,
                            "status": "completed",
                        }
                    )
                    continue

                if context.get("type") != "session_context":
                    await websocket.send_json(
                        {
                            "error": (
                                "Expected session_context JSON, "
                                "audio_end, or binary PCM16 audio data"
                            )
                        }
                    )
                    continue

                if context_configured:
                    await websocket.send_json(
                        {
                            "error": (
                                "Session context is already configured "
                                "for this stream"
                            )
                        }
                    )
                    continue

                requested_for_context = context.get(
                    "scenario",
                    requested_scenario,
                )

                requested_sector = context.get(
                    "sector",
                    "finance",
                )

                raw_amount = context.get(
                    "transaction_amount_inr"
                )

                try:
                    amount = (
                        float(raw_amount)
                        if raw_amount is not None
                        else None
                    )

                    if amount is not None and amount < 0:
                        raise ValueError(
                            "transaction_amount_inr cannot be negative"
                        )

                    resolution = (
                        stream_manager.configure_stream(
                            stream_id,
                            requested_for_context,
                            amount,
                            requested_sector,
                        )
                    )

                except (ValueError, TypeError) as exc:
                    await websocket.send_json(
                        {
                            "error": str(exc)
                        }
                    )
                    continue

                scenario = requested_for_context or resolution.scenario.value
                scenario_source = resolution.source
                transaction_amount_inr = (
                    resolution.transaction_amount_inr
                )
                context_configured = True

                await websocket.send_json(
                    {
                        "type": "session_context_ack",
                        "stream_id": stream_id,
                        "transaction_amount_inr": (
                            transaction_amount_inr
                        ),
                        "scenario": scenario,
                        "scenario_source": scenario_source,
                        "sector": requested_sector,
                    }
                )

                continue

            if "bytes" not in message:
                continue

            # Audio is only accepted after an explicit security context
            # has been configured. This prevents a stream from being
            # silently initialized with the default scenario.
            if not context_configured:
                await websocket.send_json(
                    {
                        "error": (
                            "Session context required before audio "
                            "streaming"
                        ),
                        "stream_id": stream_id,
                    }
                )
                continue

            audio_bytes = message["bytes"]

            if not audio_bytes:
                continue

            # ----------------------------------------------------------------
            # PCM16 → float32
            # ----------------------------------------------------------------

            try:

                audio = decode_pcm16(
                    audio_bytes
                )

            except ValueError as exc:

                print(
                    f"[audio] PCM error: {exc}"
                )

                await websocket.send_json(
                    {
                        "error": str(exc)
                    }
                )

                continue

            # ----------------------------------------------------------------
            # Continuous STT input
            #
            # Feed original source audio directly to the rolling STT buffer.
            # Do not feed VAD/detector windows to Whisper.
            # ----------------------------------------------------------------

            stt_snapshot = stt_stream.feed(
                audio,
                int(total_input_samples),
            )

            total_input_samples += len(audio)

            # ----------------------------------------------------------------
            # Add previous incomplete samples
            # ----------------------------------------------------------------

            if len(audio_remainder) > 0:

                audio = np.concatenate(
                    (
                        audio_remainder,
                        audio,
                    )
                )

            # ----------------------------------------------------------------
            # Determine complete VAD frames
            # ----------------------------------------------------------------

            complete_samples = (
                len(audio)
                // VAD_FRAME_SAMPLES
            ) * VAD_FRAME_SAMPLES

            # Not enough samples for one VAD frame.
            if complete_samples == 0:

                audio_remainder = audio

                if stt_snapshot is not None:
                    asyncio.create_task(
                        transcribe_snapshot_and_send(
                            websocket,
                            stream_id,
                            stt_stream,
                            stt_snapshot,
                            False,
                        )
                    )

                continue

            # Save incomplete samples for the next packet.
            audio_remainder = audio[
                complete_samples:
            ]

            # ----------------------------------------------------------------
            # Process complete VAD frames
            # ----------------------------------------------------------------

            for start in range(
                0,
                complete_samples,
                VAD_FRAME_SAMPLES,
            ):

                frame = audio[
                    start:
                    start + VAD_FRAME_SAMPLES
                ]

                # ------------------------------------------------------------
                # VAD
                # ------------------------------------------------------------

                speech = vad.is_speech(
                    frame
                )

                if not speech:
                    continue

                # ------------------------------------------------------------
                # Accumulate speech frame
                # ------------------------------------------------------------

                windows = accumulator.push(
                    frame
                )

                # ------------------------------------------------------------
                # Process completed windows
                # ------------------------------------------------------------

                for audio_window in windows:

                    # --------------------------------------------------------
                    # Skip completely silent windows
                    # --------------------------------------------------------

                    speech_detected = False

                    for vad_start in range(
                        0,
                        len(audio_window),
                        VAD_FRAME_SAMPLES,
                    ):

                        vad_frame = audio_window[
                            vad_start:
                            vad_start + VAD_FRAME_SAMPLES
                        ]

                        if len(vad_frame) != (
                            VAD_FRAME_SAMPLES
                        ):
                            continue

                        if vad.is_speech(
                            vad_frame
                        ):
                            speech_detected = True
                            break

                    if not speech_detected:

                        print(
                            f"[audio] stream={stream_id} "
                            f"silent window skipped"
                        )

                        continue

                    window_id += 1

                    window_timestamp = time.time()

                    # --------------------------------------------------------
                    # Validate audio window
                    # --------------------------------------------------------

                    audio_window = np.asarray(
                        audio_window,
                        dtype=np.float32,
                    ).reshape(-1)

                    print(
                        f"[audio-window] "
                        f"window={window_id} "
                        f"samples={len(audio_window)}"
                    )

                    # --------------------------------------------------------
                    # Feature extraction + model inference
                    #
                    # Runs in a worker thread so inference does not
                    # block the asyncio event loop.
                    # --------------------------------------------------------

                    try:

                        if alert_latched:

                            # After the live alert, do not run the
                            # primary XGBoost detector again.
                            # We only need the validated features for
                            # full-stream prosody accumulation.

                            features = await asyncio.get_running_loop().run_in_executor(
                                PRIMARY_INFERENCE_EXECUTOR,
                                extract_prosody_features_only,
                                audio_window,
                            )

                            ai_probability = None
                            latency_ms = 0.0

                        else:

                            (
                                ai_probability,
                                latency_ms,
                                features,
                            ) = await asyncio.get_running_loop().run_in_executor(
                                PRIMARY_INFERENCE_EXECUTOR,
                                process_audio_window,
                                audio_window,
                            )

                    except Exception as exc:

                        print(
                            f"[audio] "
                            f"Feature extraction failed "
                            f"for window={window_id}: "
                            f"{exc}"
                        )

                        continue

                    # Default dual-stream telemetry for this window.
                    # The Feature 5 block below updates these values when
                    # dual-stream inference actually runs.
                    dual_stream_res = None
                    dual_stream_ms = None

                    # --------------------------------------------------------
                    # SLA
                    # --------------------------------------------------------

                    sla_breach = (
                        latency_ms > E2E_SLA_MS
                    )

                    primary_xgb_ms = float(latency_ms)

                    if sla_breach:

                        print(
                            f"[audio] SLA BREACH "
                            f"stream={stream_id} "
                            f"window={window_id} "
                            f"latency={latency_ms:.2f}ms "
                            f"(ceiling={E2E_SLA_MS}ms)"
                        )

                    # --------------------------------------------------------
                    # Feature 1: Prosody
                    # --------------------------------------------------------

                    prosody_buffer.push(features, window_timestamp)

                    pitch_mean = prosody_buffer.pitch_mean()
                    pitch_std = prosody_buffer.pitch_std()
                    pitch_variance_percent = prosody_buffer.pitch_variance_percent()
                    timing_variance = prosody_buffer.timing_variance()

                    flat_prosody = prosody_buffer.is_flat_prosody()

                    # --------------------------------------------------------
                    # Supporting Prosody ML Evidence
                    #
                    # Run expensive YIN/spectral/prosody-model analysis in
                    # the background. It is enrichment only and does not
                    # affect the primary XGBoost/risk decision.
                    # --------------------------------------------------------

                    prosody_spoof_probability = None
                    prosody_signal = "UNAVAILABLE"
                    yin_analysis = None

                    # Consume the latest completed background result.
                    completed_prosody_result = (
                        prosody_analysis_results.pop(
                            stream_id,
                            None,
                        )
                    )

                    if completed_prosody_result is not None:
                        (
                            prosody_spoof_probability,
                            prosody_signal,
                            completed_prosody_data,
                        ) = completed_prosody_result

                        yin_analysis = completed_prosody_data.get(
                            "yin_analysis"
                        )

                        print(
                            "[prosody-ml] "
                            f"Consumed background result "
                            f"window={window_id} "
                            f"probability={prosody_spoof_probability:.3f} "
                            f"signal={prosody_signal}"
                        )

                    # Queue expensive supporting analysis only when no
                    # previous job is already running for this stream.
                    existing_prosody_task = (
                        prosody_analysis_tasks.get(stream_id)
                    )

                    if (
                        existing_prosody_task is None
                        or existing_prosody_task.done()
                    ):
                        prosody_audio = audio_window.copy()
                        prosody_features = features.copy()
                        prosody_window_id = window_id

                        prosody_analysis_tasks[stream_id] = (
                            asyncio.create_task(
                                _run_prosody_analysis_background(
                                    stream_id,
                                    prosody_window_id,
                                    prosody_audio,
                                    prosody_features,
                                )
                            )
                        )

                    # --------------------------------------------------------
                    # FULL-STREAM PROSODY ACCUMULATION
                    #
                    # Keep every valid window for the final stream-level
                    # prosody result. This is independent of the rolling
                    # ProsodyBuffer used for live detection.
                    # --------------------------------------------------------
                    full_prosody.push(
                        features,
                        window_timestamp,
                        spoof_probability=prosody_spoof_probability,
                    )

                    # --------------------------------------------------------
                    # AFTER ALERT: freeze live detection/dashboard
                    #
                    # The alert window itself has already completed the
                    # normal dashboard path. On every later window, keep
                    # only full-stream prosody accumulation and skip all
                    # remaining live detection work.
                    # --------------------------------------------------------
                    if alert_latched:
                        continue

                    # --------------------------------------------------------
                    # Feature 2: Speaker Verification
                    #
                    # ECAPA-TDNN is expensive (~23ms), so run it as background
                    # enrichment. It must never block the primary acoustic path.
                    # --------------------------------------------------------

                    # --------------------------------------------------------
                    # Feature 2: Speaker Verification
                    #
                    # ECAPA-TDNN is expensive (~23ms), so it runs as
                    # background enrichment. Completed results are consumed
                    # on the next available window and never block the
                    # primary acoustic decision.
                    # --------------------------------------------------------

                    speaker_similarity = None
                    speaker_match = None

                    # Consume a completed verification from an earlier
                    # window, if one is available.
                    completed_speaker_result = (
                        speaker_verification_results.pop(
                            stream_id,
                            None,
                        )
                    )

                    if completed_speaker_result is not None:
                        (
                            speaker_similarity,
                            speaker_match,
                        ) = completed_speaker_result

                        print(
                            "[speaker] "
                            f"Consumed background verification "
                            f"window={window_id} "
                            f"similarity={speaker_similarity} "
                            f"match={speaker_match}"
                        )

                    if speaker_id is not None:
                        try:
                            if speaker_verifier is None:
                                from src.speaker_verifier import SpeakerVerifier

                                speaker_verifier = SpeakerVerifier()

                            # Do not queue multiple ECAPA jobs for the same
                            # stream. This prevents CPU contention/backlog.
                            existing_task = (
                                speaker_verification_tasks.get(stream_id)
                            )

                            if (
                                existing_task is None
                                or existing_task.done()
                            ):
                                speaker_verifier_instance = speaker_verifier
                                speaker_audio = audio_window.copy()
                                speaker_id_for_task = speaker_id
                                speaker_stream_id = stream_id

                                async def _verify_speaker_background(
                                    verifier,
                                    audio,
                                    requested_speaker_id,
                                    requested_stream_id,
                                ):
                                    try:
                                        live_embedding = (
                                            await asyncio.to_thread(
                                                verifier.extract_embedding,
                                                audio,
                                            )
                                        )

                                        stream_sector = (
                                            stream_manager.get_context(
                                                requested_stream_id
                                            ).get(
                                                "sector",
                                                "finance",
                                            )
                                        )

                                        if speaker_registry.is_enrolled(
                                            requested_speaker_id,
                                            sector=stream_sector,
                                        ):
                                            try:
                                                similarity = (
                                                    speaker_registry.verify(
                                                        requested_speaker_id,
                                                        live_embedding,
                                                        sector=stream_sector,
                                                    )
                                                )

                                                match = (
                                                    speaker_registry.is_match(
                                                        requested_speaker_id,
                                                        live_embedding,
                                                        sector=stream_sector,
                                                    )
                                                )

                                                speaker_verification_results[
                                                    requested_stream_id
                                                ] = (
                                                    similarity,
                                                    match,
                                                )

                                            except UnknownSpeakerError:
                                                speaker_verification_results[
                                                    requested_stream_id
                                                ] = (None, None)

                                        else:
                                            speaker_registry.enroll(
                                                requested_speaker_id,
                                                live_embedding,
                                                sector=stream_sector,
                                            )

                                            speaker_verification_results[
                                                requested_stream_id
                                            ] = (None, None)

                                    except asyncio.CancelledError:
                                        raise

                                    except Exception as exc:
                                        print(
                                            "[speaker] "
                                            "Background verification failed "
                                            f"for speaker={requested_speaker_id}: "
                                            f"{exc}"
                                        )

                                    finally:
                                        speaker_verification_tasks.pop(
                                            requested_stream_id,
                                            None,
                                        )

                                speaker_verification_tasks[
                                    stream_id
                                ] = asyncio.create_task(
                                    _verify_speaker_background(
                                        speaker_verifier_instance,
                                        speaker_audio,
                                        speaker_id_for_task,
                                        speaker_stream_id,
                                    )
                                )

                        except Exception as exc:
                            print(
                                "[speaker] "
                                f"Failed to schedule verification "
                                f"for speaker={speaker_id}: "
                                f"{exc}"
                            )

                    # --------------------------------------------------------
                    # Features 3 & 4: Vocoder + SHAP
                    # --------------------------------------------------------

                    try:

                        # Run SHAP only for suspicious windows to preserve
                        # real-time latency. Normal windows skip SHAP.
                        shap_result = {
                            "vocoder_flag": False,
                            "diagnostic_cues": [],
                            "shap_top_features": [],
                            "shap_features": [],
                        }


                        if ai_probability >= 0.50:
                            shap_result = (
                                shap_engine.explain(
                                    features
                                )
                            )

                    except Exception as exc:

                        print(
                            f"[shap] "
                            f"Explanation failed "
                            f"for window={window_id}: "
                            f"{exc}"
                        )

                        shap_result = {
                            "vocoder_flag": False,
                            "diagnostic_cues": [],
                            "shap_top_features": [],
                            "shap_features": [],
                        }
                        
                    # --------------------------------------------------------
                    # Feature 5: Dual-Stream Trilingual Neural Inference
                    # --------------------------------------------------------
                    # Dual-stream MMS-300M inference runs independently
                    # from the primary XGBoost executor.
                    if (
                        dual_stream_classifier is not None
                        and ai_probability is not None
                    ):
                        dual_start = time.perf_counter()

                        try:
                            dual_stream_res = (
                                await asyncio.get_running_loop().run_in_executor(
                                    DUAL_STREAM_EXECUTOR,
                                    dual_stream_classifier.predict,
                                    audio_window,
                                )
                            )

                        except Exception as exc:
                            print(
                                f"[dual-stream] "
                                f"Inference failed "
                                f"for window={window_id}: "
                                f"{exc}"
                            )
                            dual_stream_res = None

                        finally:
                            dual_stream_ms = (
                                time.perf_counter() - dual_start
                            ) * 1000.0

                    total_detection_ms = (
                        primary_xgb_ms
                        + (
                            float(dual_stream_ms)
                            if dual_stream_ms is not None
                            else 0.0
                        )
                    )

                    # --------------------------------------------------------
                    # Canonical ModelPrediction

                    # --------------------------------------------------------
                    xgb_prob = float(
                        np.clip(ai_probability, 0.0, 1.0)
                    )

                    dual_prob = None
                    dual_valid = False

                    if dual_stream_res is not None:
                        raw_dual_prob = dual_stream_res.get(
                            "ai_probability"
                        )

                        if raw_dual_prob is not None:
                            try:
                                candidate_dual = float(
                                    raw_dual_prob
                                )

                                if np.isfinite(candidate_dual):
                                    dual_prob = float(
                                        np.clip(
                                            candidate_dual,
                                            0.0,
                                            1.0,
                                        )
                                    )
                                    dual_valid = True
                            except (TypeError, ValueError):
                                dual_prob = None

                    if dual_valid:
                        ensemble_prob = float(
                            np.clip(
                                0.5 * xgb_prob
                                + 0.5 * dual_prob,
                                0.0,
                                1.0,
                            )
                        )
                    else:
                        # Missing/failed dual inference must not
                        # be treated as bona-fide evidence.
                        ensemble_prob = xgb_prob

                    # --------------------------------------------------------
                    # Canonical ModelPrediction (Driven by Ensemble)
                    # --------------------------------------------------------
                    prediction = ModelPrediction(
                        stream_id=stream_id,
                        window_id=window_id,
                        timestamp=window_timestamp,
                        ai_probability=ensemble_prob,
                        model_version="ensemble-xgb-mms300m-v1",
                    )

                    # --------------------------------------------------------
                    # Risk Engine
                    # --------------------------------------------------------

                    try:

                        result = (
                            stream_manager.update(
                                prediction
                            )
                        )

                    except ValueError as exc:

                        print(
                            f"[audio] "
                            f"Risk Engine rejected "
                            f"window={window_id}: "
                            f"{exc}"
                        )

                        continue

                    # --------------------------------------------------------
                    # SIH Notification & Response Layer
                    # --------------------------------------------------------

                    notification = notification_engine.evaluate(
                        scenario=scenario,
                        risk_score=result.rolling_score,
                        alert_triggered=result.alert_triggered,
                    )

                    response_workflow_status = (
                        "TRIGGERED"
                        if notification.triggered
                        else "MONITORING"
                    )

                    dispatch_results = []

                    if notification.triggered:
                        dispatch_message = DispatchMessage(
                            title=notification.title or "Security Alert",
                            message=notification.message or "",
                            scenario=notification.scenario,
                            severity=notification.severity,
                            recommended_actions=tuple(
                                notification.recommended_actions
                            ),
                            privacy_mode=notification.privacy_mode,
                        )

                        dispatch_results = await dispatch_service.dispatch(
                            dispatch_message,
                            notification.dispatch_channels,
                        )

                    # --------------------------------------------------------
                    # Attach Sprint 1B diagnostics + notification telemetry
                    # --------------------------------------------------------

                    # YIN analysis is produced by the background
                    # prosody worker. Do not recompute it on the
                    # primary result path.
                    if yin_analysis is None:
                        yin_analysis = {
                            "f0_mean": None,
                            "f0_std": None,
                            "pitch_range": 0.0,
                            "pitch_change_rate_corrected": 0.0,
                        }

                    result = result.model_copy(
                        update={

                                "xgb_probability": round(xgb_prob, 4),
                                "dual_stream_probability": (
                                    round(dual_prob, 4)
                                    if dual_prob is not None
                                    else None
                                ),
                                "dual_stream_risk": (
                                    dual_stream_res.get("risk_level")
                                    if dual_stream_res
                                    else None
                                ),
                                "modality_gate_alpha": (
                                    dual_stream_res.get("modality_gate_alpha")
                                    if dual_stream_res
                                    else 0.64
                                ),
                                "dual_stream_latency_ms": (
                                    dual_stream_res.get("latency_ms")
                                    if dual_stream_res
                                    else None
                                ),
                                "target_languages": ["en", "hi", "ta"],
                                "ensemble_mode": "xgb_mms300m_fusion",
                            
                        

                            "dual_stream_probability": (
                                dual_stream_res.get("ai_probability")
                                if dual_stream_res
                                else None
                            ),
                            "dual_stream_risk": (
                                dual_stream_res.get("risk_level")
                                if dual_stream_res
                                else None
                            ),
                            "modality_gate_alpha": (
                                dual_stream_res.get("modality_gate_alpha")
                                if dual_stream_res
                                else 0.64
                            ),
                            "dual_stream_latency_ms": (
                                dual_stream_res.get("latency_ms")
                                if dual_stream_res
                                else None
                            ),
                            "target_languages": ["en", "hi", "ta"],


                            "yin_analysis": yin_analysis,

                            "prosody": ProsodyAnalysis(
                                pitch_mean_hz=full_prosody.pitch_mean(),
                                pitch_std_hz=full_prosody.pitch_std(),
                                pitch_variance_percent=(
                                    full_prosody.pitch_variance_percent()
                                ),
                                timing_variance=(
                                    full_prosody.timing_variance()
                                ),
                                flat_prosody=(
                                    full_prosody.is_flat_prosody()
                                ),
                                spoof_probability=(
                                    full_prosody.spoof_probability()
                                ),
                                signal=prosody_signal,
                                model_version=(
                                    PROSODY_MODEL_VERSION
                                ),
                            ),

                            "speaker_id": (
                                speaker_id
                            ),
                            "speaker_similarity": (
                                speaker_similarity
                            ),
                            "speaker_match": (
                                speaker_match
                            ),
                            "vocoder_flag": (
                                shap_result.get(
                                    "vocoder_flag"
                                )
                            ),
                            "yin_analysis": (
                                yin_analysis
                            ),
                            "diagnostic_cues": (
                                shap_result.get(
                                    "diagnostic_cues",
                                    [],
                                )
                            ),
                            "shap_top_features": (
                                shap_result.get(
                                    "shap_top_features",
                                    [],
                                )
                            ),
                            "shap_features": (
                                shap_result.get(
                                    "shap_features",
                                    [],
                                )
                            ),
                            "latency_ms": (
                                latency_ms
                            ),
                            "primary_xgb_ms": (
                                primary_xgb_ms
                            ),
                            "dual_stream_ms": (
                                dual_stream_ms
                            ),
                            "total_detection_ms": (
                                total_detection_ms
                            ),
                            "sla_breach": (
                                sla_breach
                            ),
                            "notification_scenario": (
                                notification.scenario
                            ),
                            "notification_triggered": (
                                notification.triggered
                            ),
                            "notification_threshold": (
                                notification.threshold
                            ),
                            "notification_required_consecutive_flags": (
                                notification.required_consecutive_flags
                            ),
                            "notification_severity": (
                                notification.severity
                            ),
                            "notification_title": (
                                notification.title
                            ),
                            "notification_message": (
                                notification.message
                            ),
                            "transaction_amount_inr": (
                                transaction_amount_inr
                            ),
                            "scenario_source": (
                                scenario_source
                            ),
                            "response_workflow_status": (
                                response_workflow_status
                            ),
                            "recommended_actions": (
                                notification.recommended_actions
                            ),
                            "dispatch_channels": (
                                notification.dispatch_channels
                            ),
                            "dispatch_results": [
                                {
                                    "channel": item.channel,
                                    "attempted": item.attempted,
                                    "delivered": item.delivered,
                                    "detail": item.detail,
                                    "provider_message_id": (
                                        item.provider_message_id
                                    ),
                                    "provider_status": (
                                        item.provider_status
                                    ),
                                }
                                for item in dispatch_results
                            ],
                            "privacy_mode": (
                                notification.privacy_mode
                            ),
                        }
                    )

                    # --------------------------------------------------------
                    # Sector Governance
                    # --------------------------------------------------------
                    # Consume the already-computed BoloSafe-AI result.
                    # No duplicate ML inference happens here.
                    sector_context = stream_manager.get_context(
                        stream_id
                    )

                    sector = sector_context.get(
                        "sector",
                        "finance",
                    )

                    governance_decision = evaluate_sector_result(
                        result.model_dump(),
                        sector=sector,
                        scenario=sector_context.get(
                            "scenario",
                            scenario,
                        ),
                        transaction_amount_inr=sector_context.get(
                            "transaction_amount_inr"
                        ),
                        caller_id=speaker_id,
                    )

                    result = result.model_copy(
                        update={
                            "sector": sector,
                            "governance_decision": governance_decision,
                        }
                    )

                    # --------------------------------------------------------
                    # Telemetry
                    # --------------------------------------------------------

                    print(
                        f"[audio] "
                        f"stream={stream_id} "
                        f"window={window_id} "
                        f"AI_ens={ensemble_prob:.3f} (xgb={xgb_prob:.3f}, dual={f'{dual_prob:.3f}' if dual_prob is not None else 'NA'}) "
                        f"rolling={result.rolling_score:.3f} "
                        f"flags={result.consecutive_flags} "
                        f"risk={result.risk_level.value} "
                        f"alert={result.alert_triggered} "
                        f"cues={result.diagnostic_cues} "
                        f"inference={latency_ms:.2f}ms "
                        f"sla_breach={sla_breach} "
                        f"notification={notification.triggered} "
                        f"scenario={notification.scenario}"
                    )

                    # --------------------------------------------------------
                    # Send result to browser
                    # --------------------------------------------------------

                    await websocket.send_json(
                        result.model_dump()
                    )

                    # --------------------------------------------------------
                    # Broadcast result to dashboard clients
                    # --------------------------------------------------------

                    await broadcast_result(
                        result
                    )

                    # --------------------------------------------------------
                    # --------------------------------------------------------
                    # ALERT LATCH
                    #
                    # Keep the alert immediate, but continue backend audio
                    # processing so the final prosody result covers the
                    # complete stream.
                    # --------------------------------------------------------
                    if result.alert_triggered:
                        alert_latched = True

                        print(
                            f"[audio] ALERT: "
                            f"synthetic voice alert triggered "
                            f"for stream={stream_id} "
                            f"window={window_id}; "
                            f"freezing dashboard and live detection; "
                            f"continuing prosody accumulation only"
                        )

            # ------------------------------------------------------------
            # Send STT snapshot only after this packet's RiskResults have
            # been delivered, preventing transcript messages from racing
            # ahead of the existing RiskResult WebSocket contract.
            # ------------------------------------------------------------
            if stt_snapshot is not None:
                asyncio.create_task(
                    transcribe_snapshot_and_send(
                        websocket,
                        stream_id,
                        stt_stream,
                        stt_snapshot,
                        False,
                    )
                )

    except WebSocketDisconnect:

        print(
            f"[audio] WebSocket disconnected: "
            f"stream_id={stream_id}"
        )

    except Exception as exc:

        print(
            f"[audio] Unexpected error for "
            f"stream_id={stream_id}: {exc}"
        )

    finally:

        # Flush any remaining continuous STT audio before stream cleanup.
        try:
            final_snapshot = stt_stream.final_input()
            if final_snapshot is not None:
                await transcribe_snapshot_and_send(
                    websocket,
                    stream_id,
                    stt_stream,
                    final_snapshot,
                    True,
                )
                await websocket.send_json(
                    {
                        "type": "transcript_complete",
                        "stream_id": stream_id,
                    }
                )
        except Exception as exc:
            print(
                f"[stt] Final transcription flush failed "
                f"stream={stream_id}: {exc}"
            )
        finally:
            stt_stream.reset()

        accumulator.reset()

        prosody_buffer.reset()

        audio_remainder = np.empty(
            0,
            dtype=np.float32,
        )
        audio = np.empty(
            0,
            dtype=np.float32,
        )
        audio_bytes = b""
        audio_window = np.empty(
            0,
            dtype=np.float32,
        )

        # --------------------------------------------------------
        # FINAL FULL-STREAM PROSODY SNAPSHOT
        #
        # Capture the completed prosody statistics before stream
        # cleanup removes the accumulator.
        #
        # This is intentionally NOT sent to the dashboard. The
        # dashboard freezes on the synthetic-voice alert and its
        # existing payload mechanics remain unchanged.
        # --------------------------------------------------------
        try:
            final_prosody = {
                "pitch_mean_hz": full_prosody.pitch_mean(),
                "pitch_std_hz": full_prosody.pitch_std(),
                "pitch_variance_percent": (
                    full_prosody.pitch_variance_percent()
                ),
                "timing_variance": (
                    full_prosody.timing_variance()
                ),
                "flat_prosody": (
                    full_prosody.is_flat_prosody()
                ),
                "spoof_probability": (
                    full_prosody.spoof_probability()
                ),
            }

            print(
                f"[audio] FINAL FULL-STREAM PROSODY "
                f"stream={stream_id}: "
                f"{final_prosody}"
            )

        except Exception as exc:
            print(
                f"[audio] Final full-stream prosody "
                f"snapshot failed for "
                f"stream={stream_id}: {exc}"
            )

        release_stream(stream_id)

        print(
            f"[audio] Stream reset: "
            f"stream_id={stream_id}"
        )
