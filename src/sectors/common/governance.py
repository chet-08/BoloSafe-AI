from __future__ import annotations

from typing import Any

from src.sectors.finance.router import evaluate_financial_result
from src.sectors.retail.router import evaluate_retail_result


def evaluate_sector_result(
    result: dict[str, Any],
    *,
    sector: str,
    scenario: str,
    transaction_amount_inr: float | None = None,
) -> dict[str, Any]:
    """
    Route an already-computed BoloSafe-AI result to the
    appropriate sector governance policy.

    Core ML inference happens only once upstream.
    """

    if sector == "finance":
        decision = evaluate_financial_result(
            result,
            scenario=scenario,
            transaction_amount_inr=transaction_amount_inr,
        )

    elif sector == "retail":
        decision = evaluate_retail_result(
            result,
            scenario=scenario,
        )

    else:
        raise ValueError(
            f"Sector governance is not implemented for: {sector!r}"
        )

    return decision.model_dump()
