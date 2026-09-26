from __future__ import annotations

from .oms_integrator import build_retail_oms_hold
from .otp_challenger import build_retail_otp_challenge
from .schemas import RetailDecision


def evaluate_retail_call(
    *,
    scenario: str,
    ai_probability: float,
    speaker_similarity: float | None,
    speaker_match: bool | None,
    stream_id: str | None = None,
) -> RetailDecision:
    """
    Convert the shared BoloSafe-AI detection result into a
    retail-specific security workflow.

    Core detection remains upstream. This layer decides what
    the retail operation should do next.
    """
    ai_probability = max(0.0, min(1.0, float(ai_probability)))

    if ai_probability >= 0.75:
        risk_level = "high"
    elif ai_probability >= 0.40:
        risk_level = "medium"
    else:
        risk_level = "low"

    # A verified AI-risk mismatch should never be silently allowed.
    if speaker_match is False and risk_level == "low":
        risk_level = "medium"

    otp_required = risk_level in {"medium", "high"}
    oms_required = (
        scenario == "order_modification" and risk_level == "high"
    )
    supervisor_required = risk_level == "high"

    otp_challenge = (
        build_retail_otp_challenge(scenario=scenario)
        if otp_required
        else None
    )

    oms_hold = (
        build_retail_oms_hold(
            scenario=scenario,
            risk_score=ai_probability,
            stream_id=stream_id,
        )
        if oms_required
        else None
    )

    if risk_level == "high":
        if scenario == "order_modification":
            workflow_status = "order_held"
            workflow_actions = [
                "Place the requested order modification on hold.",
                "Issue a step-up OTP challenge.",
                "Escalate the interaction to a retail fraud supervisor.",
            ]
        else:
            workflow_status = "escalated"
            workflow_actions = [
                "Place the sensitive request on hold.",
                "Issue a step-up OTP challenge.",
                "Escalate the interaction to a retail fraud supervisor.",
            ]

        return RetailDecision(
            scenario=scenario,
            ai_probability=ai_probability,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="high",
            verification_required=True,
            action="hold_and_escalate",
            reason=(
                "High voice-AI risk detected during the retail interaction."
            ),
            recommended_actions=workflow_actions,
            workflow_status=workflow_status,
            otp_challenge_required=otp_required,
            oms_hold_required=oms_required,
            supervisor_escalation_required=supervisor_required,
            workflow_actions=workflow_actions,
            otp_challenge=otp_challenge,
            oms_hold=oms_hold,
        )

    if risk_level == "medium":
        workflow_actions = [
            "Trigger step-up OTP authentication.",
            "Proceed only after successful customer verification.",
        ]

        return RetailDecision(
            scenario=scenario,
            ai_probability=ai_probability,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="medium",
            verification_required=True,
            action="step_up_verification",
            reason=(
                "Additional identity verification is required before "
                "completing the retail request."
            ),
            recommended_actions=workflow_actions,
            workflow_status="verification_required",
            otp_challenge_required=True,
            oms_hold_required=False,
            supervisor_escalation_required=False,
            workflow_actions=workflow_actions,
            otp_challenge=otp_challenge,
            oms_hold=None,
        )

    if scenario == "order_modification":
        workflow_actions = [
            "Continue the order workflow.",
            "Apply normal order verification before modification.",
        ]
    elif scenario == "account_assistance":
        workflow_actions = [
            "Continue account assistance.",
            "Apply standard account verification.",
        ]
    else:
        workflow_actions = [
            "Continue the customer-care interaction.",
        ]

    return RetailDecision(
        scenario=scenario,
        ai_probability=ai_probability,
        speaker_similarity=speaker_similarity,
        speaker_match=speaker_match,
        risk_level="low",
        verification_required=False,
        action="allow",
        reason="No retail security escalation is currently required.",
        recommended_actions=workflow_actions,
        workflow_status="allowed",
        otp_challenge_required=False,
        oms_hold_required=False,
        supervisor_escalation_required=False,
        workflow_actions=workflow_actions,
        otp_challenge=None,
        oms_hold=None,
    )
