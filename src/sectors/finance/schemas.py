from __future__ import annotations

from typing import Literal

from pydantic import Field

from src.sectors.common.schemas import GovernanceDecision


FinanceAction = Literal[
    "allow",
    "step_up_verification",
    "hold_and_escalate",
]


class FinanceDecision(GovernanceDecision):
    sector: Literal["finance"] = "finance"

    action: FinanceAction

    transaction_amount_inr: float | None = Field(
        default=None,
        ge=0,
    )
