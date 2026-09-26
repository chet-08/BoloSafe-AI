from __future__ import annotations

from .schemas import HospitalityDecision


HIGH_VALUE_FOLIO_THRESHOLD_INR = 20_000.0


def evaluate_hospitality_call(
    *,
    scenario: str,
    ai_probability: float,
    speaker_similarity: float | None,
    speaker_match: bool | None,
    transaction_amount_inr: float | None = None,
) -> HospitalityDecision:
    """
    Hospitality policy layer.

    Combines voice-AI probability, speaker verification,
    hospitality scenario, and folio transaction value into
    a guest-protection workflow.
    """

    ai_probability = max(0.0, min(1.0, float(ai_probability)))

    if transaction_amount_inr is not None:
        transaction_amount_inr = max(0.0, float(transaction_amount_inr))

    high_value_request = (
        transaction_amount_inr is not None
        and transaction_amount_inr >= HIGH_VALUE_FOLIO_THRESHOLD_INR
    )

    # High synthetic probability -> immediate folio protection.
    if ai_probability >= 0.75:
        return HospitalityDecision(
            scenario=scenario,
            ai_probability=ai_probability,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="high",
            verification_required=True,
            action="lock_folio_and_escalate",
            reason=(
                "High voice-AI clone likelihood detected during "
                "hospitality service request."
            ),
            recommended_actions=[
                "Immediately lock room folio and suspend phone-authorized billing.",
                "Mandate physical government ID verification at the hotel front desk.",
                "Alert Duty Manager and Concierge security dispatch.",
            ],
        )

    # Speaker mismatch -> require human verification.
    if speaker_match is False:
        return HospitalityDecision(
            scenario=scenario,
            ai_probability=ai_probability,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="medium",
            verification_required=True,
            action="require_front_desk_id",
            reason=(
                "Guest voiceprint does not match the registered "
                "in-house guest."
            ),
            recommended_actions=[
                "Send secondary SMS verification to the primary reservation phone.",
                "Require physical government ID verification at reception.",
                "Restrict room-key re-issuance until the guest is verified.",
            ],
        )

    # High-value folio requests require stronger verification.
    if high_value_request:
        return HospitalityDecision(
            scenario=scenario,
            ai_probability=ai_probability,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="medium",
            verification_required=True,
            action="require_front_desk_id",
            reason=(
                f"High-value hospitality request of ₹{transaction_amount_inr:,.0f} "
                "requires additional guest verification before folio authorization."
            ),
            recommended_actions=[
                "Require physical government ID verification at the front desk.",
                "Confirm the request with the registered reservation contact.",
                "Do not authorize the folio charge until verification succeeds.",
            ],
        )

    # Elevated synthetic probability.
    if ai_probability >= 0.40:
        return HospitalityDecision(
            scenario=scenario,
            ai_probability=ai_probability,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="medium",
            verification_required=True,
            action="require_front_desk_id",
            reason=(
                "Elevated synthetic acoustic markers detected during "
                "the hospitality service request."
            ),
            recommended_actions=[
                "Send secondary SMS verification to the primary reservation phone.",
                "Require physical government ID verification at reception.",
            ],
        )

    # Normal hospitality request.
    return HospitalityDecision(
        scenario=scenario,
        ai_probability=ai_probability,
        speaker_similarity=speaker_similarity,
        speaker_match=speaker_match,
        risk_level="low",
        verification_required=False,
        action="allow",
        reason=(
            "Guest voice verified within the available "
            "hospitality biometric and acoustic parameters."
        ),
        recommended_actions=[
            "Proceed with the guest reservation or concierge request.",
        ],
    )
