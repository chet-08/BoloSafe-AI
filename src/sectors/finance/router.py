from __future__ import annotations

from .policy import evaluate_financial_call
from .schemas import FinanceDecision


def evaluate_financial_result(
    result: dict,
    *,
    scenario: str = "high_value_transfer",
    transaction_amount_inr: float | None = None,
) -> FinanceDecision:
    # Resolve risk level whether it's an enum (RiskLevel.LOW) or a string
    raw_risk = result.get("risk_level")
    if hasattr(raw_risk, "value"):
        risk_str = str(raw_risk.value).lower()
    elif raw_risk is not None:
        risk_str = str(raw_risk).lower()
    else:
        risk_str = None

    eff_amount = (
        transaction_amount_inr
        if transaction_amount_inr is not None
        else result.get("transaction_amount_inr")
    )

    return evaluate_financial_call(
        scenario=scenario,
        ai_probability=result.get("ai_probability", 0.0),
        speaker_similarity=result.get("speaker_similarity"),
        speaker_match=result.get("speaker_match"),
        transaction_amount_inr=eff_amount,
        risk_level=risk_str,
        rolling_score=result.get("rolling_score"),
        alert_triggered=bool(result.get("alert_triggered", False)),
        composite_risk_score=result.get("composite_risk_score"),
        is_cross_sector_threat=bool(result.get("is_cross_sector_threat", False)),
    )
