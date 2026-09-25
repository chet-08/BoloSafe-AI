from __future__ import annotations

from typing import Any
from .policy import evaluate_hospitality_call
from .schemas import HospitalityDecision


def evaluate_hospitality_result(
    result: dict[str, Any],
    scenario: str = "guest_verification",
) -> HospitalityDecision:
    """
    Adapt the shared BoloSafe-AI detection result into a hospitality decision.
    """

    return evaluate_hospitality_call(
        scenario=scenario,
        ai_probability=result.get("ai_probability", 0.0),
        speaker_similarity=result.get("speaker_similarity"),
        speaker_match=result.get("speaker_match"),
    )
