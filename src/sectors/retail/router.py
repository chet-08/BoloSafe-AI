from __future__ import annotations

from .policy import evaluate_retail_call
from .schemas import RetailDecision


def evaluate_retail_result(
    result: dict,
    scenario: str = "customer_care",
) -> RetailDecision:
    """
    Adapt the shared BoloSafe-AI WebSocket result into a retail decision.
    """

    return evaluate_retail_call(
        scenario=scenario,
        ai_probability=result.get("ai_probability", 0.0),
        speaker_similarity=result.get("speaker_similarity"),
        speaker_match=result.get("speaker_match"),
    )
