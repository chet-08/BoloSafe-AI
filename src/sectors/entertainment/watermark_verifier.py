"""
Watermark & voice-identity verifier for Entertainment & Media.

Combines:
  - Person 1's ECAPA-TDNN speaker embedding (injected as a callable)
  - The artist registry (``artist_registry.py``)
into a structured verdict that ``policy.py`` consumes via the router.

The verifier is deterministic and side-effect free. It does NOT import torch
or any heavy ML dependency — the caller injects an ``embedding_fn`` when raw
audio needs to be embedded.
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from enum import Enum
from typing import Callable, Optional

import numpy as np

from .artist_registry import ArtistRegistry, DEFAULT_REGISTRY


class StemVerdict(str, Enum):
    HUMAN_AUTHENTIC = "human_authentic"
    VOICE_THEFT = "voice_theft"
    SYNTHETIC_CLONE = "synthetic_clone"
    UNKNOWN_ARTIST = "unknown_artist"


@dataclass(frozen=True)
class WatermarkResult:
    verdict: StemVerdict
    declared_artist_id: Optional[str]
    matched_artist_id: Optional[str]
    matched_display_name: Optional[str]
    speaker_similarity: float
    speaker_match: bool
    licensed: bool
    reason: str

    def to_dict(self) -> dict:
        payload = asdict(self)
        payload["verdict"] = self.verdict.value
        return payload


def verify_stem(
    *,
    audio_embedding: np.ndarray,
    declared_artist_id: Optional[str],
    embedding_fn: Optional[Callable[[np.ndarray], np.ndarray]] = None,
    registry: ArtistRegistry = DEFAULT_REGISTRY,
    match_threshold: float = 0.75,
) -> WatermarkResult:
    """
    Verify a dubbing stem against the registered artist voiceprints.

    Args:
        audio_embedding: Either the 192-D ECAPA-TDNN embedding of the stem,
            or raw audio if ``embedding_fn`` is provided.
        declared_artist_id: The artist the studio claims performed the stem.
        embedding_fn: Optional callable — audio_array -> 192-D embedding.
            Inject this to avoid importing torch inside this module.
        registry: Artist voiceprint registry.
        match_threshold: Cosine similarity above which we consider a match.

    Returns:
        WatermarkResult with a 4-way verdict.
    """
    if embedding_fn is not None:
        audio_embedding = embedding_fn(audio_embedding)

    audio_embedding = np.asarray(audio_embedding, dtype=np.float32)

    if audio_embedding.shape != (192,):
        raise ValueError(
            f"Expected 192-D embedding, got {audio_embedding.shape}"
        )

    match = registry.top_match(audio_embedding, threshold=match_threshold)

    # Case 1: no registered artist matches closely enough → synthetic
    if match.artist_id is None:
        return WatermarkResult(
            verdict=StemVerdict.SYNTHETIC_CLONE,
            declared_artist_id=declared_artist_id,
            matched_artist_id=None,
            matched_display_name=None,
            speaker_similarity=float(match.cosine),
            speaker_match=False,
            licensed=False,
            reason=(
                f"No registered voice artist matched above "
                f"{match_threshold:.2f} (best cosine = {match.cosine:.3f}). "
                f"Likely synthetic clone."
            ),
        )

    # Case 2: matches a registered artist, but none was declared
    if declared_artist_id is None:
        return WatermarkResult(
            verdict=StemVerdict.UNKNOWN_ARTIST,
            declared_artist_id=None,
            matched_artist_id=match.artist_id,
            matched_display_name=match.display_name,
            speaker_similarity=float(match.cosine),
            speaker_match=True,
            licensed=match.licensed,
            reason=(
                f"Stem matches registered artist {match.artist_id!r} but "
                f"no artist was declared in the submission metadata."
            ),
        )

    # Case 3: declared != matched → voice theft
    if match.artist_id != declared_artist_id:
        return WatermarkResult(
            verdict=StemVerdict.VOICE_THEFT,
            declared_artist_id=declared_artist_id,
            matched_artist_id=match.artist_id,
            matched_display_name=match.display_name,
            speaker_similarity=float(match.cosine),
            speaker_match=False,
            licensed=False,
            reason=(
                f"Declared artist {declared_artist_id!r} but stem matches "
                f"{match.artist_id!r} (cosine = {match.cosine:.3f}). "
                f"Possible unauthorized voice use."
            ),
        )

    # Case 4: declared == matched, but license is not active
    if not match.licensed:
        return WatermarkResult(
            verdict=StemVerdict.VOICE_THEFT,
            declared_artist_id=declared_artist_id,
            matched_artist_id=match.artist_id,
            matched_display_name=match.display_name,
            speaker_similarity=float(match.cosine),
            speaker_match=True,
            licensed=False,
            reason=(
                f"Artist {match.artist_id!r} matches, but no active license "
                f"covers this submission."
            ),
        )

    # Case 5: declared == matched, licensed → authentic
    return WatermarkResult(
        verdict=StemVerdict.HUMAN_AUTHENTIC,
        declared_artist_id=declared_artist_id,
        matched_artist_id=match.artist_id,
        matched_display_name=match.display_name,
        speaker_similarity=float(match.cosine),
        speaker_match=True,
        licensed=True,
        reason=(
            f"Stem matches declared artist {match.artist_id!r} "
            f"(cosine = {match.cosine:.3f}); license verified."
        ),
    )