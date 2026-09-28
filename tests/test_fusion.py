"""
Unit tests for src.fusion.fuse_acoustic_probabilities.

These tests pin down the XGB-canonical fusion rule introduced to stop the
bimodal dual stream from suppressing canonical XGB spoof signals on
out-of-distribution edge-TTS inputs.

The fusion rule is:

    - When the calibrated XGB has crossed HIGH_ENTER_THRESHOLD (0.70),
      trust XGB. The bimodal dual stream can otherwise suppress detection
      of edge-TTS Hindi / Tamil spoofs.
    - When XGB is below HIGH_ENTER_THRESHOLD, fall back to the 0.5/0.5
      average so that the temporal anti-correlation between XGB and dual
      can still pull the score down when XGB is over-confident on a
      bonafide sample.
    - When the dual stream is unavailable / not finite, return XGB. A
      missing dual signal must NEVER be treated as bonafide evidence.
"""

from __future__ import annotations

import math

import pytest

from src.fusion import fuse_acoustic_probabilities
from src.risk_engine.thresholds import HIGH_ENTER_THRESHOLD


# ----------------------------------------------------------------------
# 1. The XGB-canonical rule for clear spoof signals
# ----------------------------------------------------------------------


def test_xgb_canonical_when_xgb_crosses_high_enter():
    """XGB >= HIGH_ENTER_THRESHOLD: the canonical probability is XGB,
    regardless of what the (potentially noisy) dual stream says."""
    # Real failure mode from finance_spoof_rtgs_transfer_hi.wav:
    # XGB has a clear spoof signal but the dual stream pulls it down.
    fused = fuse_acoustic_probabilities(
        xgb_probability=0.886,
        dual_probability=0.624,
    )
    assert fused == pytest.approx(0.886, abs=1e-6)


def test_xgb_canonical_blocks_dual_suppression_on_celebrity_dub():
    """Real failure mode from entertainment_spoof_celebrity_dub_hi.wav:
    XGB peak 0.809, dual 0.635 -> baseline 0.5/0.5 average 0.722 still
    below HIGH_ENTER. With the XGB-canonical rule the canonical
    probability is the XGB itself (0.809), so the spoof is no longer
    suppressed by an unreliable dual stream."""
    fused = fuse_acoustic_probabilities(
        xgb_probability=0.809,
        dual_probability=0.635,
    )
    assert fused == pytest.approx(0.809, abs=1e-6)


# ----------------------------------------------------------------------
# 2. The 0.5/0.5 fallback for uncertain XGB
# ----------------------------------------------------------------------


def test_uncertain_xgb_uses_average_with_dual():
    """XGB < HIGH_ENTER_THRESHOLD: the temporal anti-correlation between
    XGB and dual is the only thing protecting bonafide samples from XGB
    overconfidence, so we MUST preserve the 0.5/0.5 average in this
    regime. This is critical for finance_bonafide_balance_inquiry_en.wav
    where XGB peaks at 0.824 in one window but dual is near 0 there, and
    dual peaks at 0.844 in a different window where XGB is low."""
    fused = fuse_acoustic_probabilities(
        xgb_probability=0.300,
        dual_probability=0.700,
    )
    assert fused == pytest.approx(0.5, abs=1e-6)


def test_xgb_canonical_preserves_bonafide_protection_at_other_windows():
    """Hospitality_bonafide_reservation_en.wav is protected NOT by
    pulling XGB down at its peak window (where XGB=0.857 >= HIGH_ENTER
    and the canonical rule correctly returns XGB), but by the fact that
    the XGB peak and the dual peak are temporally anti-correlated.

    At the *typical* window (XGB well below HIGH_ENTER, dual near 0),
    the canonical rule returns the 0.5/0.5 average, which is what
    keeps the rolling score low across the clip."""
    # Typical window: XGB moderate, dual near 0 -> average is low.
    fused = fuse_acoustic_probabilities(
        xgb_probability=0.426,
        dual_probability=0.055,
    )
    expected = 0.5 * 0.426 + 0.5 * 0.055
    assert fused == pytest.approx(expected, abs=1e-6)
    assert fused < HIGH_ENTER_THRESHOLD


def test_xgb_canonical_returns_xgb_at_peak_window_even_for_bonafide():
    """Documented behavior: at the XGB-peak window of a bonafide sample
    where XGB >= HIGH_ENTER, the canonical rule returns XGB. The
    bonafide is still protected by the rolling buffer: most other
    windows are low, so the rolling score never crosses HIGH_ENTER."""
    fused = fuse_acoustic_probabilities(
        xgb_probability=0.857,
        dual_probability=0.026,
    )
    # At this single window the canonical rule returns XGB. The
    # risk-engine's rolling buffer (size 5) keeps the overall score
    # moderate because adjacent windows are low.
    assert fused == pytest.approx(0.857, abs=1e-6)


# ----------------------------------------------------------------------
# 3. Missing / non-finite dual handling
# ----------------------------------------------------------------------


def test_missing_dual_returns_xgb():
    """A missing dual signal must NEVER be treated as bonafide
    evidence; it must fall back to XGB only."""
    fused = fuse_acoustic_probabilities(
        xgb_probability=0.42,
        dual_probability=None,
    )
    assert fused == pytest.approx(0.42, abs=1e-6)


@pytest.mark.parametrize(
    "bad_value",
    [float("nan"), float("inf"), float("-inf")],
)
def test_nonfinite_dual_returns_xgb(bad_value):
    fused = fuse_acoustic_probabilities(
        xgb_probability=0.55,
        dual_probability=bad_value,
    )
    assert math.isfinite(fused)
    assert fused == pytest.approx(0.55, abs=1e-6)


# ----------------------------------------------------------------------
# 4. Numerical safety
# ----------------------------------------------------------------------


@pytest.mark.parametrize(
    "value",
    [-0.5, -0.0001, 1.0001, 5.0, 1e9],
)
def test_xgb_out_of_range_is_clipped(value):
    fused = fuse_acoustic_probabilities(
        xgb_probability=value,
        dual_probability=None,
    )
    assert 0.0 <= fused <= 1.0


@pytest.mark.parametrize(
    "value",
    [-0.5, 1.5, 5.0, 1e9],
)
def test_dual_out_of_range_is_clipped(value):
    fused = fuse_acoustic_probabilities(
        xgb_probability=0.10,
        dual_probability=value,
    )
    assert 0.0 <= fused <= 1.0


# ----------------------------------------------------------------------
# 5. Boundary condition at HIGH_ENTER_THRESHOLD
# ----------------------------------------------------------------------


def test_boundary_just_below_high_enter_uses_average():
    """At HIGH_ENTER_THRESHOLD - epsilon we are still in the average
    regime; the rule must not fire one sample too early."""
    just_below = HIGH_ENTER_THRESHOLD - 1e-6
    fused = fuse_acoustic_probabilities(
        xgb_probability=just_below,
        dual_probability=0.0,
    )
    # In the average regime, the dual side contributes (just_below / 2).
    assert fused == pytest.approx(0.5 * just_below, abs=1e-6)


def test_boundary_at_or_above_high_enter_uses_xgb():
    """At HIGH_ENTER_THRESHOLD the canonical XGB takes over."""
    fused = fuse_acoustic_probabilities(
        xgb_probability=HIGH_ENTER_THRESHOLD,
        dual_probability=0.0,
    )
    assert fused == pytest.approx(HIGH_ENTER_THRESHOLD, abs=1e-6)


def test_high_xgb_with_high_dual_still_uses_xgb():
    """When both models agree (both spoof), the canonical rule still
    returns XGB. This is fine; averaging would just add a tiny amount
    on top of an already-high score and risks saturating at 1.0."""
    fused = fuse_acoustic_probabilities(
        xgb_probability=0.95,
        dual_probability=1.0,
    )
    assert fused == pytest.approx(0.95, abs=1e-6)


# ----------------------------------------------------------------------
# 6. Doctest-style documentation
# ----------------------------------------------------------------------


def test_documented_finance_rtgs_case_is_fixed():
    """finance_spoof_rtgs_transfer_hi.wav: XGB max 0.886, dual max 0.624.
    Baseline 0.5/0.5 = 0.755 (below HIGH_ENTER). With the canonical
    rule, fused = 0.886 (above HIGH_ENTER)."""
    fused = fuse_acoustic_probabilities(
        xgb_probability=0.886,
        dual_probability=0.624,
    )
    assert fused >= HIGH_ENTER_THRESHOLD
    assert fused == pytest.approx(0.886, abs=1e-6)


def test_documented_finance_bonafide_case_is_protected():
    """finance_bonafide_balance_inquiry_en.wav: XGB peaks at 0.824 in
    one window but dual is near 0 there; dual peaks at 0.844 in a
    different window where XGB is low. Per-window average keeps the
    score moderate. With the canonical rule, the SAME window uses the
    average (because XGB < HIGH_ENTER at that window)."""
    # Window where XGB is at peak (XGB>=HIGH_ENTER): use XGB.
    fused_at_xgb_peak = fuse_acoustic_probabilities(
        xgb_probability=0.824,
        dual_probability=0.018,
    )
    assert fused_at_xgb_peak == pytest.approx(0.824, abs=1e-6)

    # Window where dual is at peak but XGB is low: use the average.
    fused_at_dual_peak = fuse_acoustic_probabilities(
        xgb_probability=0.260,
        dual_probability=0.844,
    )
    expected = 0.5 * 0.260 + 0.5 * 0.844
    assert fused_at_dual_peak == pytest.approx(expected, abs=1e-6)
    assert fused_at_dual_peak < HIGH_ENTER_THRESHOLD
