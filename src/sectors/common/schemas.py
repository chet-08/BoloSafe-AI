from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


Sector = Literal[
    "finance",
    "retail",
    "hospitality",
    "entertainment",
]

SecurityAction = Literal[
    "allow",
    "step_up_verification",
    "hold_and_escalate",
    "flag_content",
]


class SectorContext(BaseModel):
    """
    Business context supplied by the active sector workflow.

    The core BoloSafe-AI engine remains sector-agnostic.
    """

    sector: Sector
    scenario: str

    # Optional business context.
    customer_id: str | None = None
    transaction_amount_inr: float | None = Field(default=None, ge=0)
    reference_id: str | None = None


class GovernanceDecision(BaseModel):
    """
    Common contract returned by every sector governance layer.
    """

    sector: Sector
    scenario: str

    risk_level: Literal["low", "medium", "high"]

    ai_probability: float = Field(ge=0.0, le=1.0)

    speaker_similarity: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
    )

    speaker_match: bool | None = None

    verification_required: bool

    action: SecurityAction

    reason: str

    recommended_actions: list[str] = Field(
        default_factory=list
    )
