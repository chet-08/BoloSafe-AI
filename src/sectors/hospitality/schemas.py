from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field


HospitalityScenario = Literal[
    "reservation_change",
    "guest_verification",
    "vip_booking",
]

HospitalityAction = Literal[
    "allow",
    "require_front_desk_id",
    "lock_folio_and_escalate",
]


class HospitalityDecision(BaseModel):
    sector: str = "hospitality"
    scenario: HospitalityScenario

    ai_probability: float = Field(ge=0.0, le=1.0)
    speaker_similarity: float | None = Field(default=None, ge=0.0, le=1.0)
    speaker_match: bool | None = None

    risk_level: Literal["low", "medium", "high"]

    verification_required: bool
    action: HospitalityAction

    reason: str
    recommended_actions: list[str] = Field(default_factory=list)
