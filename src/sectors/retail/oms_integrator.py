from __future__ import annotations

from typing import Any


def build_retail_oms_hold(
    *,
    scenario: str,
    risk_score: float,
    stream_id: str | None = None,
) -> dict[str, Any]:
    """
    Build a mock OMS shipment/order hold payload.

    The function does not call an external commerce platform.
    It produces the integration payload that a Shopify/OMS
    adapter can dispatch later.
    """
    suffix = (stream_id or "pending")[-8:].upper()

    return {
        "type": "retail_oms_hold",
        "status": "ready",
        "action": "HOLD_SHIPMENT",
        "order_reference": f"SIM-ORDER-{suffix}",
        "scenario": scenario,
        "risk_score": round(float(risk_score), 4),
        "reason": "High voice-AI risk detected during an order modification.",
    }
