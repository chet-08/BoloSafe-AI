"""Unit tests for the Entertainment & Media sector module."""
from __future__ import annotations

import numpy as np
import pytest
import soundfile as sf

from src.sectors.entertainment.artist_registry import (
    ArtistProfile,
    ArtistRegistry,
    build_demo_registry,
)
from src.sectors.entertainment.watermark_verifier import (
    StemVerdict,
    verify_stem,
)
from src.sectors.entertainment.certificate_generator import (
    generate_certificate,
    verify_certificate_signature,
    ProvenanceCertificate,
)
from src.sectors.entertainment.router import evaluate_entertainment_result


# ---------------- artist_registry ----------------

def test_registry_enroll_and_top_match():
    reg = ArtistRegistry()
    emb = np.random.default_rng(0).standard_normal(192).astype(np.float32)
    reg.enroll(ArtistProfile("ART-1", "Alice", ("en",), True, emb))

    result = reg.top_match(emb.copy())
    assert result.artist_id == "ART-1"
    assert result.cosine > 0.99


def test_registry_rejects_wrong_shape():
    reg = ArtistRegistry()
    bad = np.zeros(128, dtype=np.float32)
    with pytest.raises(ValueError, match="192"):
        reg.enroll(ArtistProfile("X", "Y", ("en",), True, bad))


def test_registry_no_match_below_threshold():
    reg = ArtistRegistry()
    emb = np.random.default_rng(1).standard_normal(192).astype(np.float32)
    reg.enroll(ArtistProfile("ART-1", "Alice", ("en",), True, emb))

    other = np.random.default_rng(999).standard_normal(192).astype(np.float32)
    result = reg.top_match(other, threshold=0.99)
    assert result.artist_id is None


def test_demo_registry_has_three_artists():
    reg = build_demo_registry()
    assert len(reg) == 3
    assert "ART-HI-009" in reg
    assert "ART-EN-003" in reg
    assert "ART-TA-014" in reg


# ---------------- watermark_verifier ----------------

def test_verify_human_authentic():
    reg = build_demo_registry()
    artist = reg.get("ART-HI-009")
    result = verify_stem(
        audio_embedding=artist.embedding.copy(),
        declared_artist_id="ART-HI-009",
        registry=reg,
    )
    assert result.verdict == StemVerdict.HUMAN_AUTHENTIC
    assert result.speaker_match is True
    assert result.licensed is True


def test_verify_voice_theft_wrong_declared_artist():
    reg = build_demo_registry()
    ta_artist = reg.get("ART-TA-014")
    result = verify_stem(
        audio_embedding=ta_artist.embedding.copy(),
        declared_artist_id="ART-HI-009",
        registry=reg,
    )
    assert result.verdict == StemVerdict.VOICE_THEFT
    assert result.matched_artist_id == "ART-TA-014"
    assert result.declared_artist_id == "ART-HI-009"
    assert result.speaker_match is False


def test_verify_synthetic_clone_no_match():
    reg = build_demo_registry()
    random_emb = np.random.default_rng(42).standard_normal(192).astype(np.float32)
    result = verify_stem(
        audio_embedding=random_emb,
        declared_artist_id="ART-HI-009",
        registry=reg,
        match_threshold=0.99,
    )
    assert result.verdict == StemVerdict.SYNTHETIC_CLONE
    assert result.matched_artist_id is None
    assert result.speaker_match is False


def test_verify_unknown_artist_no_declaration():
    reg = build_demo_registry()
    artist = reg.get("ART-TA-014")
    result = verify_stem(
        audio_embedding=artist.embedding.copy(),
        declared_artist_id=None,
        registry=reg,
    )
    assert result.verdict == StemVerdict.UNKNOWN_ARTIST
    assert result.matched_artist_id == "ART-TA-014"


def test_verify_unlicensed_artist():
    reg = ArtistRegistry()
    emb = np.random.default_rng(5).standard_normal(192).astype(np.float32)
    reg.enroll(ArtistProfile("ART-X", "Unlicensed", ("hi",), False, emb))

    result = verify_stem(
        audio_embedding=emb,
        declared_artist_id="ART-X",
        registry=reg,
    )
    assert result.verdict == StemVerdict.VOICE_THEFT
    assert result.licensed is False
    assert "no active license" in result.reason


# ---------------- certificate_generator ----------------

def _write_dummy_wav(tmp_path) -> "object":
    from pathlib import Path

    wav = Path(tmp_path) / "stem.wav"
    sr = 16000
    audio = (0.1 * np.random.default_rng(7).standard_normal(sr)).astype(np.float32)
    sf.write(wav, audio, sr, subtype="PCM_16")
    return wav


def test_certificate_signature_roundtrip(tmp_path):
    reg = build_demo_registry()
    artist = reg.get("ART-HI-009")
    result = verify_stem(
        audio_embedding=artist.embedding.copy(),
        declared_artist_id="ART-HI-009",
        registry=reg,
    )
    wav = _write_dummy_wav(tmp_path)
    cert = generate_certificate(audio_path=wav, watermark_result=result)

    assert cert.audio_sha256
    assert cert.wipo_tag.startswith("WIPO-PROV-")
    assert verify_certificate_signature(cert) is True


def test_certificate_detects_tampering(tmp_path):
    reg = build_demo_registry()
    artist = reg.get("ART-TA-014")
    result = verify_stem(
        audio_embedding=artist.embedding.copy(),
        declared_artist_id="ART-TA-014",
        registry=reg,
    )
    wav = _write_dummy_wav(tmp_path)
    cert = generate_certificate(audio_path=wav, watermark_result=result)

    tampered = ProvenanceCertificate(
        certificate_id=cert.certificate_id,
        issued_at_utc=cert.issued_at_utc,
        audio_sha256="deadbeef" + cert.audio_sha256[8:],
        verdict=cert.verdict,
        declared_artist_id=cert.declared_artist_id,
        matched_artist_id=cert.matched_artist_id,
        speaker_similarity=cert.speaker_similarity,
        licensed=cert.licensed,
        legal_notice=cert.legal_notice,
        wipo_tag=cert.wipo_tag,
        signature=cert.signature,
    )
    assert verify_certificate_signature(tampered) is False


# ---------------- integration with existing router/policy ----------------

def test_router_high_ai_probability_blocks():
    decision = evaluate_entertainment_result(
        {
            "ai_probability": 0.92,
            "speaker_similarity": 0.30,
            "speaker_match": False,
        },
        scenario="voice_authenticity",
    )
    assert decision.action == "block_rights_and_escalate"
    assert decision.risk_level == "high"


def test_router_low_ai_probability_certifies():
    decision = evaluate_entertainment_result(
        {
            "ai_probability": 0.05,
            "speaker_similarity": 0.94,
            "speaker_match": True,
        },
        scenario="voice_authenticity",
    )
    assert decision.action == "certify_authentic"
    assert decision.risk_level == "low"


def test_router_medium_risk_spectral_audit():
    decision = evaluate_entertainment_result(
        {
            "ai_probability": 0.55,
            "speaker_similarity": 0.60,
            "speaker_match": False,
        },
        scenario="dubbing_verification",
    )
    assert decision.action == "flag_for_spectral_audit"
    assert decision.risk_level == "medium"
