"""
Provenance certificate generator for Entertainment & Media.

Produces a signed, verifiable JSON certificate attached to a dubbing stem,
theatrical release, or OTT delivery package.

Legal basis:
  - Sec 38B, Indian Copyright Act 1957 (Performer's Moral Rights)
  - WIPO Performances and Phonograms Treaty (WPPT) provenance tag

The certificate is signed with HMAC-SHA256 over a canonical JSON payload.
This is sufficient for demo tamper-detection. Production deployments should
use Ed25519 with an HSM-held private key.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional

from .watermark_verifier import WatermarkResult, StemVerdict

_SIGNING_KEY = b"bolosafe-entertainment-demo-key-2025"


@dataclass(frozen=True)
class ProvenanceCertificate:
    certificate_id: str
    issued_at_utc: str
    audio_sha256: str
    verdict: str
    declared_artist_id: Optional[str]
    matched_artist_id: Optional[str]
    speaker_similarity: float
    licensed: bool
    legal_notice: str
    wipo_tag: str
    signature: str

    def to_json(self, *, indent: int = 2) -> str:
        return json.dumps(asdict(self), indent=indent, ensure_ascii=False)

    def to_dict(self) -> dict:
        return asdict(self)


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def _sign(payload: dict) -> str:
    canonical = json.dumps(payload, sort_keys=True, ensure_ascii=False).encode()
    return hmac.new(_SIGNING_KEY, canonical, hashlib.sha256).hexdigest()


def verify_certificate_signature(cert: ProvenanceCertificate) -> bool:
    """Recompute the HMAC over the certificate's canonical payload."""
    payload = {
        "certificate_id": cert.certificate_id,
        "issued_at_utc": cert.issued_at_utc,
        "audio_sha256": cert.audio_sha256,
        "verdict": cert.verdict,
        "declared_artist_id": cert.declared_artist_id,
        "matched_artist_id": cert.matched_artist_id,
        "speaker_similarity": cert.speaker_similarity,
        "licensed": cert.licensed,
    }
    expected = _sign(payload)
    return hmac.compare_digest(expected, cert.signature)


def _legal_notice(verdict: StemVerdict) -> str:
    if verdict == StemVerdict.HUMAN_AUTHENTIC:
        return (
            "This stem has been verified as an authentic human performance. "
            "Issued under Sec 38B, Indian Copyright Act 1957, and WIPO WPPT Art. 5."
        )
    if verdict == StemVerdict.VOICE_THEFT:
        return (
            "WARNING: Voice identity mismatch detected. Unauthorized use of a "
            "performer's voice may constitute infringement under Sec 38B, "
            "Indian Copyright Act 1957. Distribution should be withheld pending review."
        )
    if verdict == StemVerdict.SYNTHETIC_CLONE:
        return (
            "WARNING: No matching human performer voiceprint found. Stem is likely "
            "AI-synthesized. Distribution must be blocked pending consent verification."
        )
    return (
        "INCOMPLETE: Submission lacks a declared performer identity. "
        "Cannot certify authenticity."
    )


def generate_certificate(
    *,
    audio_path: str | Path,
    watermark_result: WatermarkResult,
    certificate_id: Optional[str] = None,
) -> ProvenanceCertificate:
    """Build a signed provenance certificate for a submitted stem."""
    path = Path(audio_path)
    if not path.exists():
        raise FileNotFoundError(f"Audio file not found: {path}")

    audio_hash = _sha256_file(path)
    issued_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    cert_id = certificate_id or f"BSAFE-ENT-{audio_hash[:12].upper()}"

    payload = {
        "certificate_id": cert_id,
        "issued_at_utc": issued_at,
        "audio_sha256": audio_hash,
        "verdict": watermark_result.verdict.value,
        "declared_artist_id": watermark_result.declared_artist_id,
        "matched_artist_id": watermark_result.matched_artist_id,
        "speaker_similarity": round(watermark_result.speaker_similarity, 6),
        "licensed": watermark_result.licensed,
    }
    signature = _sign(payload)

    return ProvenanceCertificate(
        certificate_id=cert_id,
        issued_at_utc=issued_at,
        audio_sha256=audio_hash,
        verdict=watermark_result.verdict.value,
        declared_artist_id=watermark_result.declared_artist_id,
        matched_artist_id=watermark_result.matched_artist_id,
        speaker_similarity=round(watermark_result.speaker_similarity, 6),
        licensed=watermark_result.licensed,
        legal_notice=_legal_notice(watermark_result.verdict),
        wipo_tag=f"WIPO-PROV-{cert_id}",
        signature=signature,
    )