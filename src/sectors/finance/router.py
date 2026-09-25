from __future__ import annotations

from .policy import evaluate_financial_call
from .schemas import FinanceDecision


def evaluate_financial_result(
    result: dict,
    *,
    scenario: str = "high_value_transfer",
    transaction_amount_inr: float | None = None,
) -> FinanceDecision:
    return evaluate_financial_call(
        scenario=scenario,
        ai_probability=result.get("ai_probability", 0.0),
        speaker_similarity=result.get("speaker_similarity"),
        speaker_match=result.get("speaker_match"),
        transaction_amount_inr=transaction_amount_inr,
    )
