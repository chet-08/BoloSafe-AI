"""
tests/test_multi_tenant_registry.py
Unit tests verifying multi-tenant speaker registry partitioning,
cross-tenant isolation, and DPDP compliance (Person 1 — Core Architecture).
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import numpy as np
import pytest

from src.speaker_registry import (
    SpeakerRegistry,
    UnknownSpeakerError,
    SPEAKER_EMBEDDING_DIM,
)


def test_sector_partitioned_enrollment():
    reg = SpeakerRegistry()
    emb_fin = np.random.randn(SPEAKER_EMBEDDING_DIM).astype(np.float32)
    emb_hosp = np.random.randn(SPEAKER_EMBEDDING_DIM).astype(np.float32)

    # Enroll Alice in finance and Bob in hospitality
    reg.enroll("alice_corp_treasurer", emb_fin, sector="finance")
    reg.enroll("bob_vip_guest", emb_hosp, sector="hospitality")

    # Verify sector isolation
    assert reg.is_enrolled("alice_corp_treasurer", sector="finance") is True
    assert reg.is_enrolled("alice_corp_treasurer", sector="hospitality") is False
    assert reg.is_enrolled("bob_vip_guest", sector="hospitality") is True
    assert reg.is_enrolled("bob_vip_guest", sector="finance") is False


def test_cross_tenant_isolation_raises_unknown():
    reg = SpeakerRegistry()
    emb = np.random.randn(SPEAKER_EMBEDDING_DIM).astype(np.float32)
    reg.enroll("alice_bank_customer", emb, sector="finance")

    # Attempting to verify Alice within hospitality must raise UnknownSpeakerError
    with pytest.raises(UnknownSpeakerError):
        reg.verify("alice_bank_customer", emb, sector="hospitality")

    # Verifying Alice within finance succeeds and returns 1.0
    score = reg.verify("alice_bank_customer", emb, sector="finance")
    assert score == pytest.approx(1.0, abs=1e-5)


def test_enrolled_speakers_by_sector():
    reg = SpeakerRegistry()
    reg.enroll("bank_user_1", np.random.randn(192).astype(np.float32), sector="finance")
    reg.enroll("bank_user_2", np.random.randn(192).astype(np.float32), sector="finance")
    reg.enroll("retail_shopper", np.random.randn(192).astype(np.float32), sector="retail")
    reg.enroll("voice_actor_1", np.random.randn(192).astype(np.float32), sector="entertainment")

    assert set(reg.enrolled_speakers(sector="finance")) == {"bank_user_1", "bank_user_2"}
    assert set(reg.enrolled_speakers(sector="retail")) == {"retail_shopper"}
    assert set(reg.enrolled_speakers(sector="entertainment")) == {"voice_actor_1"}
    assert "retail_shopper" in reg.enrolled_speakers()  # global list contains all


def test_sector_specific_removal():
    reg = SpeakerRegistry()
    emb = np.random.randn(192).astype(np.float32)
    reg.enroll("charlie", emb, sector="finance")
    reg.enroll("charlie", emb, sector="retail")

    # Remove only from finance
    reg.remove("charlie", sector="finance")
    assert reg.is_enrolled("charlie", sector="finance") is False
    assert reg.is_enrolled("charlie", sector="retail") is True
