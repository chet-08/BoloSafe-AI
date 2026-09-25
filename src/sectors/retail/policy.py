from __future__ import annotations

from .schemas import RetailDecision


def evaluate_retail_call(
    *,
    scenario: str,
    ai_probability: float,
    speaker_similarity: float | None,
    speaker_match: bool | None,
) -> RetailDecision:
    """
    Retail policy layer.

    The shared BoloSafe-AI detection/verification stack supplies the
    measurements. This module converts those measurements into a
    retail-specific response workflow.
    """

    ai_probability = max(0.0, min(1.0, float(ai_probability)))

    if ai_probability >= 0.75:
        risk_level = "high"
    elif ai_probability >= 0.40:
        risk_level = "medium"
    else:
        risk_level = "low"

    if risk_level == "high":
        return RetailDecision(
            scenario=scenario,
            ai_probability=ai_probability,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="high",
            verification_required=True,
            action="hold_and_escalate",
            reason="High voice-AI risk detected during the retail interaction.",
            recommended_actions=[
                "Place the requested transaction or account action on hold.",
                "Escalate the interaction to a human agent.",
                "Require additional customer verification before proceeding.",
            ],
        )

    if risk_level == "medium" or speaker_match is False:
        return RetailDecision(
            scenario=scenario,
            ai_probability=ai_probability,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="medium",
            verification_required=True,
            action="step_up_verification",
            reason="Additional identity verification is required before completing the request.",
            recommended_actions=[
                "Trigger step-up authentication.",
                "Proceed only after successful verification.",
            ],
        )

    return RetailDecision(
        scenario=scenario,
        ai_probability=ai_probability,
        speaker_similarity=speaker_similarity,
        speaker_match=speaker_match,
        risk_level="low",
        verification_required=False,
        action="allow",
        reason="No retail security escalation is currently required.",
        recommended_actions=[
            "Continue the customer interaction.",
        ],
    )
