from __future__ import annotations

from .schemas import FinanceDecision


def evaluate_financial_call(
    *,
    scenario: str,
    ai_probability: float,
    speaker_similarity: float | None,
    speaker_match: bool | None,
    transaction_amount_inr: float | None = None,
) -> FinanceDecision:

    ai_probability = max(0.0, min(1.0, float(ai_probability)))

    if ai_probability >= 0.75:
        risk_level = "high"
    elif ai_probability >= 0.40:
        risk_level = "medium"
    else:
        risk_level = "low"

    # High AI probability OR confirmed speaker mismatch
    # results in a financial hold and escalation.
    if risk_level == "high":
        return FinanceDecision(
            scenario=scenario,
            ai_probability=ai_probability,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="high",
            verification_required=True,
            action="hold_and_escalate",
            transaction_amount_inr=transaction_amount_inr,
            reason=(
                "High voice-fraud risk detected during the "
                "financial interaction."
            ),
            recommended_actions=[
                "Place the financial transaction on hold.",
                "Require strong customer authentication.",
                "Escalate the interaction to the fraud team.",
            ],
        )

    # Medium AI risk or explicit speaker mismatch requires
    # additional verification.
    if risk_level == "medium" or speaker_match is False:
        return FinanceDecision(
            scenario=scenario,
            ai_probability=ai_probability,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="medium",
            verification_required=True,
            action="step_up_verification",
            transaction_amount_inr=transaction_amount_inr,
            reason=(
                "Additional customer verification is required "
                "before completing the financial request."
            ),
            recommended_actions=[
                "Trigger step-up authentication.",
                "Require OTP or banking-app verification.",
                "Proceed only after successful verification.",
            ],
        )

    return FinanceDecision(
        scenario=scenario,
        ai_probability=ai_probability,
        speaker_similarity=speaker_similarity,
        speaker_match=speaker_match,
        risk_level="low",
        verification_required=False,
        action="allow",
        transaction_amount_inr=transaction_amount_inr,
        reason=(
            "No financial security escalation is currently required."
        ),
        recommended_actions=[
            "Continue the customer interaction.",
            "Allow the requested action under normal controls.",
        ],
    )
