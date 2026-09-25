from __future__ import annotations

from .schemas import HospitalityDecision


def evaluate_hospitality_call(
    *,
    scenario: str,
    ai_probability: float,
    speaker_similarity: float | None,
    speaker_match: bool | None,
) -> HospitalityDecision:
    """
    Hospitality policy layer.

    Translates BoloSafe-AI acoustic and speaker biometric measurements
    into hotel reservation and guest-protection workflows.
    """

    ai_probability = max(0.0, min(1.0, float(ai_probability)))

    if ai_probability >= 0.75:
        risk_level = "high"
    elif ai_probability >= 0.40:
        risk_level = "medium"
    else:
        risk_level = "low"

    if risk_level == "high":
        return HospitalityDecision(
            scenario=scenario,
            ai_probability=ai_probability,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="high",
            verification_required=True,
            action="lock_folio_and_escalate",
            reason="High voice-AI clone likelihood detected during hospitality service request.",
            recommended_actions=[
                "Immediately lock room folio and suspend phone-authorized billing.",
                "Mandate physical government ID check-in at hotel front desk.",
                "Alert Duty Manager and Concierge security dispatch.",
            ],
        )

    if risk_level == "medium" or speaker_match is False:
        return HospitalityDecision(
            scenario=scenario,
            ai_probability=ai_probability,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="medium",
            verification_required=True,
            action="require_front_desk_id",
            reason="Guest voice mismatch or elevated synthetic acoustic markers detected.",
            recommended_actions=[
                "Send secondary SMS verification link to primary reservation phone.",
                "Restrict room key re-issuance until verified at reception.",
            ],
        )

    return HospitalityDecision(
        scenario=scenario,
        ai_probability=ai_probability,
        speaker_similarity=speaker_similarity,
        speaker_match=speaker_match,
        risk_level="low",
        verification_required=False,
        action="allow",
        reason="Guest voice verified within authentic biometric parameters.",
        recommended_actions=[
            "Proceed with guest reservation request or concierge assistance.",
        ],
    )
