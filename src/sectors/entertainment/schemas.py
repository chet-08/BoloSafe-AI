from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field


EntertainmentScenario = Literal[
    "voice_authenticity",
    "speaker_comparison",
    "dubbing_verification",
]

EntertainmentAction = Literal[
    "certify_authentic",
    "flag_for_spectral_audit",
    "block_rights_and_escalate",
]


class EntertainmentDecision(BaseModel):
    sector: str = "entertainment"
    scenario: EntertainmentScenario

    ai_probability: float = Field(ge=0.0, le=1.0)
    speaker_similarity: float | None = Field(default=None, ge=0.0, le=1.0)
    speaker_match: bool | None = None

    risk_level: Literal["low", "medium", "high"]

    verification_required: bool
    action: EntertainmentAction

    reason: str
    recommended_actions: list[str] = Field(default_factory=list)
