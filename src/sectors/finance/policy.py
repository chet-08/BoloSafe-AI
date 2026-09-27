from __future__ import annotations

from .schemas import FinanceDecision


def evaluate_financial_call(
    *,
    scenario: str,
    ai_probability: float,
    speaker_similarity: float | None,
    speaker_match: bool | None,
    transaction_amount_inr: float | None = None,
    risk_level: str | None = None,
    rolling_score: float | None = None,
    alert_triggered: bool = False,
    composite_risk_score: float | None = None,
    is_cross_sector_threat: bool = False,
) -> FinanceDecision:
    """
    Evaluate financial transaction risk by consuming canonical RiskEngine signals
    (rolling_score, risk_level, alert_triggered) alongside composite risk
    (acoustic + biometric + monetary exposure) and cross-sector threat intelligence.
    """
    ai_prob = max(0.0, min(1.0, float(ai_probability)))
    comp_score = (
        max(0.0, min(1.0, float(composite_risk_score)))
        if composite_risk_score is not None
        else None
    )
    engine_level = str(risk_level).lower() if risk_level else None

    # 1. HIGH RISK (Hold and Escalate)
    # Triggered if:
    # - RiskEngine alert fired (alert_triggered == True)
    # - RiskEngine reached HIGH state (engine_level == "high")
    # - Cross-sector threat intelligence matches active fraud
    # - Instantaneous AI probability >= 0.75
    # - Composite risk >= 0.65 (severe combined acoustic + biometric + financial risk)
    # - Speaker mismatch with elevated AI probability (>= 0.50) or elevated composite risk (>= 0.55)
    is_high = (
        alert_triggered is True
        or engine_level == "high"
        or is_cross_sector_threat is True
        or ai_prob >= 0.75
        or (comp_score is not None and comp_score >= 0.65)
        or (speaker_match is False and (ai_prob >= 0.50 or (comp_score is not None and comp_score >= 0.55)))
    )

    # 2. MEDIUM RISK (Step-up Verification)
    # Triggered if:
    # - Not high, AND
    # - RiskEngine reached MEDIUM state (engine_level == "medium")
    # - Composite risk >= 0.40 (e.g. high-value transaction + unverified or suspicious voice)
    # - Instantaneous AI probability >= 0.40
    # - Rolling score >= 0.40
    # - Biometric speaker mismatch (speaker_match is False)
    is_medium = (
        not is_high
        and (
            engine_level == "medium"
            or (comp_score is not None and comp_score >= 0.40)
            or ai_prob >= 0.40
            or (rolling_score is not None and rolling_score >= 0.40)
            or speaker_match is False
        )
    )

    if is_high:
        if alert_triggered:
            reason = (
                "Critical synthetic voice alert triggered by Risk Engine "
                "during financial interaction."
            )
        elif is_cross_sector_threat:
            reason = (
                "Cross-sector threat detected: caller ID matches active "
                "fraud pattern across tertiary sectors."
            )
        elif comp_score is not None and comp_score >= 0.65:
            reason = (
                f"Critical composite risk ({comp_score * 100:.1f}%) combining "
                "voice synthesis, biometric, and monetary exposure."
            )
        elif speaker_match is False:
            reason = (
                "High voice-fraud risk with biometric speaker mismatch "
                "detected during financial interaction."
            )
        else:
            reason = (
                "High voice-fraud risk detected during the "
                "financial interaction."
            )

        return FinanceDecision(
            scenario=scenario,
            ai_probability=ai_prob,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="high",
            verification_required=True,
            action="hold_and_escalate",
            transaction_amount_inr=transaction_amount_inr,
            composite_risk_score=comp_score,
            rolling_score=rolling_score,
            alert_triggered=alert_triggered,
            reason=reason,
            recommended_actions=[
                "Place the financial transaction on hold.",
                "Require strong customer authentication.",
                "Escalate the interaction to the fraud team.",
            ],
        )

    if final_medium := is_medium:
        if comp_score is not None and comp_score >= 0.40:
            if transaction_amount_inr is not None:
                reason = (
                    f"Elevated composite risk ({comp_score * 100:.1f}%) requires "
                    f"step-up verification for transaction ₹{transaction_amount_inr:,.0f}."
                )
            else:
                reason = (
                    f"Elevated composite risk ({comp_score * 100:.1f}%) requires "
                    "step-up customer verification."
                )
        elif speaker_match is False:
            reason = (
                "Biometric voiceprint mismatch detected. Step-up customer "
                "authentication required before completing financial request."
            )
        elif engine_level == "medium":
            reason = (
                "Risk Engine indicates elevated suspicious acoustic activity. "
                "Additional customer verification required."
            )
        else:
            reason = (
                "Additional customer verification is required "
                "before completing the financial request."
            )

        return FinanceDecision(
            scenario=scenario,
            ai_probability=ai_prob,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="medium",
            verification_required=True,
            action="step_up_verification",
            transaction_amount_inr=transaction_amount_inr,
            composite_risk_score=comp_score,
            rolling_score=rolling_score,
            alert_triggered=alert_triggered,
            reason=reason,
            recommended_actions=[
                "Trigger step-up authentication.",
                "Require OTP or banking-app verification.",
                "Proceed only after successful verification.",
            ],
        )

    return FinanceDecision(
        scenario=scenario,
        ai_probability=ai_prob,
        speaker_similarity=speaker_similarity,
        speaker_match=speaker_match,
        risk_level="low",
        verification_required=False,
        action="allow",
        transaction_amount_inr=transaction_amount_inr,
        composite_risk_score=comp_score,
        rolling_score=rolling_score,
        alert_triggered=alert_triggered,
        reason="No financial security escalation is currently required.",
        recommended_actions=[
            "Continue the customer interaction.",
            "Allow the requested action under normal controls.",
        ],
    )
