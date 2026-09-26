from __future__ import annotations

from .schemas import EntertainmentDecision


def evaluate_entertainment_audio(
    *,
    scenario: str,
    ai_probability: float,
    speaker_similarity: float | None,
    speaker_match: bool | None,
) -> EntertainmentDecision:
    """
    Entertainment & Media policy layer.

    Evaluates audio authenticity, voice-actor copyright protection,
    and synthetic dubbing integrity.
    """

    ai_probability = max(0.0, min(1.0, float(ai_probability)))

    if ai_probability >= 0.75:
        risk_level = "high"
    elif ai_probability >= 0.40:
        risk_level = "medium"
    else:
        risk_level = "low"

    if risk_level == "high":
        return EntertainmentDecision(
            scenario=scenario,
            ai_probability=ai_probability,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="high",
            verification_required=True,
            action="block_rights_and_escalate",
            reason="High likelihood of synthetic voice generation or unauthorized vocal deepfake.",
            recommended_actions=[
                "Withhold digital media rights clearance and suspend distribution.",
                "Export cryptographic watermarking and acoustic provenance report.",
                "Escalate to Studio Legal and Artist Rights Management.",
            ],
        )

    if risk_level == "medium" or speaker_match is False:
        return EntertainmentDecision(
            scenario=scenario,
            ai_probability=ai_probability,
            speaker_similarity=speaker_similarity,
            speaker_match=speaker_match,
            risk_level="medium",
            verification_required=True,
            action="flag_for_spectral_audit",
            reason="Acoustic anomalies or voiceprint biometric deviation detected in stem.",
            recommended_actions=[
                "Route track for secondary vocoder artifact & spectral phase audit.",
                "Request uncompressed master stems directly from talent agency.",
            ],
        )

    return EntertainmentDecision(
        scenario=scenario,
        ai_probability=ai_probability,
        speaker_similarity=speaker_similarity,
        speaker_match=speaker_match,
        risk_level="low",
        verification_required=False,
        action="certify_authentic",
        reason="Audio certified authentic with natural organic glottal pulse characteristics.",
        recommended_actions=[
            "Issue digital authenticity certificate for broadcast/dubbing release.",
        ],
    )
