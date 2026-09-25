from __future__ import annotations

SECTOR_REGISTRY = {
    "finance": {
        "label": "Financial Services",
        "short_label": "Finance",
        "description": "Voice fraud and transaction security.",
        "primary": True,
        "scenarios": {
            "high_value_transfer": "High-Value Transfer",
            "account_recovery": "Account Recovery",
            "customer_verification": "Customer Verification",
        },
    },
    "retail": {
        "label": "Retail",
        "short_label": "Retail",
        "description": "Customer-care and order security.",
        "primary": False,
        "scenarios": {
            "customer_care": "Customer Care",
            "order_modification": "Order Modification",
            "account_assistance": "Account Assistance",
        },
    },
    "hospitality": {
        "label": "Hospitality",
        "short_label": "Hospitality",
        "description": "Reservation and guest verification.",
        "primary": False,
        "scenarios": {
            "reservation_change": "Reservation Change",
            "guest_verification": "Guest Verification",
            "vip_booking": "VIP Booking",
        },
    },
    "entertainment": {
        "label": "Entertainment",
        "short_label": "Entertainment",
        "description": "Voice artist and synthetic-content authenticity.",
        "primary": False,
        "scenarios": {
            "voice_authenticity": "Voice Authenticity",
            "speaker_comparison": "Speaker Comparison",
            "dubbing_verification": "Dubbing Verification",
        },
    },
}


def get_sector(sector: str) -> dict:
    try:
        return SECTOR_REGISTRY[sector]
    except KeyError as exc:
        raise ValueError(f"Unknown sector: {sector}") from exc


def list_sectors() -> list[dict]:
    return [
        {
            "id": sector_id,
            **config,
        }
        for sector_id, config in SECTOR_REGISTRY.items()
    ]
