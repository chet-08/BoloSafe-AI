from __future__ import annotations

from typing import Any


def build_retail_otp_challenge(
    *,
    scenario: str,
    ttl_seconds: int = 120,
) -> dict[str, Any]:
    """
    Build a declarative retail step-up verification action.

    This is intentionally a mock/integration-ready payload:
    no real OTP is sent from the policy layer.
    """
    return {
        "type": "retail_otp_challenge",
        "status": "ready",
        "channel": "registered_customer_contact",
        "ttl_seconds": ttl_seconds,
        "scenario": scenario,
        "verification_method": "one_time_passphrase",
    }
