from src.privacy_policy import (
    PRIVACY_POLICY,
    assert_zero_retention,
    pseudonymize_speaker_id,
    scrub_ram_buffer,
    generate_dpdp_compliance_record,
)
import numpy as np


def test_zero_retention_is_enabled_by_default():
    assert PRIVACY_POLICY.mode == "feature_only"
    assert PRIVACY_POLICY.retain_raw_audio is False


def test_zero_retention_guard_passes():
    assert_zero_retention()


def test_pseudonymize_speaker_id_irreversibility():
    phone = "+919876543210"
    pseudo1 = pseudonymize_speaker_id(phone)
    pseudo2 = pseudonymize_speaker_id(phone)
    assert pseudo1 == pseudo2
    assert pseudo1.startswith("spk_")
    assert phone not in pseudo1


def test_scrub_ram_buffer_zeros():
    buf = np.ones(1024, dtype=np.float32)
    assert np.any(buf != 0)
    success = scrub_ram_buffer(buf)
    assert success is True
    assert np.all(buf == 0.0)


def test_generate_dpdp_compliance_record():
    record = generate_dpdp_compliance_record("stream_fin_001", "finance")
    assert record["raw_audio_persisted"] is False
    assert record["ephemeral_ram_only"] is True
    assert "DPDP" in record["compliance_standard"]
