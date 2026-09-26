from __future__ import annotations

from .policy import evaluate_retail_call
from .schemas import RetailDecision


VALID_RETAIL_SCENARIOS = {
    "customer_care",
    "order_modification",
    "account_assistance",
}


def evaluate_retail_result(
    result: dict,
    scenario: str = "customer_care",
) -> RetailDecision:
    """
    Adapt the shared BoloSafe-AI result into a retail decision.

    Legacy/non-retail scenarios are mapped to the generic
    customer-care workflow instead of crashing governance.
    """
    if scenario not in VALID_RETAIL_SCENARIOS:
        scenario = "customer_care"

    return evaluate_retail_call(
        scenario=scenario,
        ai_probability=result.get("ai_probability", 0.0),
        speaker_similarity=result.get("speaker_similarity"),
        speaker_match=result.get("speaker_match"),
        stream_id=result.get("stream_id"),
    )
