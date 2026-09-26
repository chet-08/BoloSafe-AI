from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


RetailScenario = Literal[
    "customer_care",
    "order_modification",
    "account_assistance",
]

RetailAction = Literal[
    "allow",
    "step_up_verification",
    "hold_and_escalate",
]


class RetailDecision(BaseModel):
    sector: str = "retail"
    scenario: RetailScenario

    ai_probability: float = Field(ge=0.0, le=1.0)
    speaker_similarity: float | None = Field(default=None, ge=0.0, le=1.0)
    speaker_match: bool | None = None

    risk_level: Literal["low", "medium", "high"]

    verification_required: bool
    action: RetailAction

    reason: str
    recommended_actions: list[str] = Field(default_factory=list)

    # Retail-specific workflow execution state.
    workflow_status: Literal[
        "allowed",
        "verification_required",
        "order_held",
        "escalated",
    ] = "allowed"

    otp_challenge_required: bool = False
    oms_hold_required: bool = False
    supervisor_escalation_required: bool = False

    workflow_actions: list[str] = Field(default_factory=list)

    # Integration-ready mock payloads.
    otp_challenge: dict | None = None
    oms_hold: dict | None = None
