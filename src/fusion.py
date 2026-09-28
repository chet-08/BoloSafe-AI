"""
Acoustic-model fusion for the /ws/audio pipeline.

The live /ws/audio pipeline receives per-window probabilities from two
acoustic models:

  - Calibrated XGBoost (58-D DSP features)        -> xgb_probability
  - Dual-stream MMS-300M + 58-D DSP fusion       -> dual_probability

Why the XGB-canonical rule (not a flat 0.5/0.5 average)?

Empirically, the dual-stream classifier is bimodal and unreliable on
out-of-distribution edge-TTS inputs (Hindi / Tamil sector demos). It
saturates at 0.0 or 1.0 instead of producing calibrated probabilities,
and the peak of the bimodal saturation is often mis-aligned with the
true label (e.g. it returns 1.0 on certain English edge-TTS bonafide
clips, and 0.0 on certain Tamil spoofs).

A flat 0.5/0.5 average therefore has two failure modes:

  1. The dual stream pulls the canonical XGB spoof score *down* on
     genuine spoofs (XGB ~ 0.85, dual ~ 0.65 -> ensemble ~ 0.75,
     below HIGH_ENTER_THRESHOLD). Examples in this repo:
       entertainment_spoof_celebrity_dub_hi.wav
       finance_spoof_rtgs_transfer_hi.wav

  2. The dual stream pulls the canonical XGB bonafide score *up* on
     edge-TTS bonafides where the dual stream is wrong, but the 0.5/0.5
     average is partially protected by the temporal anti-correlation
     between XGB and dual peaks. That protection only survives when
     we keep averaging.

The XGB-canonical rule preserves both:

  - When the calibrated XGB has already crossed HIGH_ENTER_THRESHOLD,
    the canonical probability is the XGB. The bimodal dual cannot
    suppress a clear canonical spoof signal.

  - When XGB is below HIGH_ENTER_THRESHOLD, we fall back to the
    0.5/0.5 average. This keeps the temporal anti-correlation that
    protects bonafide samples from XGB overconfidence.

The threshold used (HIGH_ENTER_THRESHOLD = 0.70) is the same
risk-engine boundary that already governs the LOW -> HIGH state
transition. It is not a hardcoded magic number; it is the canonical
"clear spoof signal" boundary that already exists in the system.

This module is the single source of truth for the fusion rule.
Both the live /ws/audio pipeline and the validation harness call
:func:`fuse_acoustic_probabilities`.
"""

from __future__ import annotations

import math

from src.risk_engine.thresholds import HIGH_ENTER_THRESHOLD


def fuse_acoustic_probabilities(
    xgb_probability: float,
    dual_probability: float | None,
) -> float:
    """
    Compute the canonical acoustic probability for the /ws/audio pipeline.

    Args:
        xgb_probability: Calibrated 58-D XGBoost probability, expected in
            ``[0, 1]``. Values outside that range are clipped.
        dual_probability: Dual-stream MMS-300M + DSP probability, expected
            in ``[0, 1]``. Pass ``None`` (or a non-finite value) when the
            dual stream is unavailable / failed.

    Returns:
        The fused probability in ``[0, 1]``.
    """
    x = _clip01(xgb_probability)
    if dual_probability is None or not math.isfinite(float(dual_probability)):
        return x

    d = _clip01(dual_probability)

    if x >= HIGH_ENTER_THRESHOLD:
        # Canonical XGB has crossed the clear-spoof boundary.
        # Trust the calibrated model; do not let the bimodal dual
        # suppress detection of OOD spoofs (edge-TTS Hindi / Tamil).
        return x

    # XGB is uncertain. Average with the dual stream so the temporal
    # anti-correlation between the two models can still pull the
    # score down when XGB is over-confident on a bonafide sample.
    return _clip01(0.5 * x + 0.5 * d)


def _clip01(value: float) -> float:
    try:
        v = float(value)
    except (TypeError, ValueError):
        return 0.0
    if not math.isfinite(v):
        return 0.0
    if v < 0.0:
        return 0.0
    if v > 1.0:
        return 1.0
    return v
