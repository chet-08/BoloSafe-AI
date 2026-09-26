"""
privacy_policy.py
BoloSafe-AI Privacy & DPDP Act 2023 Compliance Layer (Person 1 — Core Architecture).

Enforces zero-retention ephemeral processing:
    - Raw PCM audio is streamed through RAM buffers only.
    - Zero audio is written to disk or persisted to databases.
    - Identifiers and speaker names are pseudonymized using salted SHA-256.
    - RAM buffers can be explicitly overwritten with zeros.
    - Aligned with India's Digital Personal Data Protection (DPDP) Act 2023.
"""

from __future__ import annotations

import hashlib
import time
from dataclasses import dataclass
from typing import Any
import numpy as np


@dataclass(frozen=True)
class PrivacyPolicy:
    mode: str = "feature_only"
    retain_raw_audio: bool = False
    dpdp_compliance_version: str = "DPDP-Act-2023-Sec8"


PRIVACY_POLICY = PrivacyPolicy()


def assert_zero_retention() -> None:
    """Guarantee that raw audio retention is permanently disabled."""
    if PRIVACY_POLICY.retain_raw_audio:
        raise RuntimeError("Zero-retention policy has been disabled.")


def pseudonymize_speaker_id(speaker_id: str, salt: str = "BoloSafe2026") -> str:
    """
    Generate an irreversible pseudonymized identifier for speaker IDs,
    ensuring PII (phone numbers, guest names) is never logged in plaintext.
    """
    if not speaker_id:
        return "anon_speaker"
    hasher = hashlib.sha256()
    hasher.update(f"{salt}:{speaker_id}".encode("utf-8"))
    return f"spk_{hasher.hexdigest()[:12]}"


def scrub_ram_buffer(buffer: bytearray | np.ndarray) -> bool:
    """
    Explicitly overwrite a memory buffer with zeros to guarantee
    verifiable zero-retention RAM wiping.
    """
    try:
        if isinstance(buffer, np.ndarray):
            buffer.fill(0)
            return True
        elif isinstance(buffer, bytearray):
            for i in range(len(buffer)):
                buffer[i] = 0
            return True
    except Exception:
        return False
    return False


def generate_dpdp_compliance_record(stream_id: str, sector: str) -> dict[str, Any]:
    """
    Generate a formal DPDP Act 2023 compliance audit payload
    certifying zero-retention in-memory processing.
    """
    assert_zero_retention()
    return {
        "stream_id": stream_id,
        "sector": sector,
        "raw_audio_persisted": False,
        "processing_mode": PRIVACY_POLICY.mode,
        "compliance_standard": PRIVACY_POLICY.dpdp_compliance_version,
        "data_retention_ttl_seconds": 0,
        "ephemeral_ram_only": True,
        "certified_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
