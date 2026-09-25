from __future__ import annotations

from typing import Any
from .policy import evaluate_entertainment_audio
from .schemas import EntertainmentDecision


def evaluate_entertainment_result(
    result: dict[str, Any],
    scenario: str = "voice_authenticity",
) -> EntertainmentDecision:
    """
    Adapt the shared BoloSafe-AI detection result into an entertainment decision.
    """

    return evaluate_entertainment_audio(
        scenario=scenario,
        ai_probability=result.get("ai_probability", 0.0),
        speaker_similarity=result.get("speaker_similarity"),
        speaker_match=result.get("speaker_match"),
    )
