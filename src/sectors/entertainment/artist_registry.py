"""
Artist voiceprint registry for Entertainment & Media.

Maps licensed voice artists to their enrolled 192-D ECAPA-TDNN embeddings.
Used by watermark_verifier.py to detect unauthorized voice cloning under
Sec 38B of the Indian Copyright Act, 1957 and WIPO WPPT.

The demo registry mirrors the three entertainment scenarios produced by
``scripts/build_sector_datasets.py`` (voice_authenticity, dubbing_verification,
speaker_comparison).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import numpy as np


@dataclass(frozen=True)
class ArtistProfile:
    artist_id: str
    display_name: str
    languages: tuple[str, ...]
    licensed: bool
    embedding: np.ndarray  # shape (192,), L2-normalized


@dataclass
class MatchResult:
    artist_id: Optional[str]
    display_name: Optional[str]
    cosine: float
    licensed: bool


class ArtistRegistry:
    """In-memory registry of licensed voice artists."""

    def __init__(self) -> None:
        self._artists: dict[str, ArtistProfile] = {}

    def enroll(self, profile: ArtistProfile) -> None:
        if profile.embedding.shape != (192,):
            raise ValueError(
                f"Expected 192-D embedding, got {profile.embedding.shape}"
            )
        norm = float(np.linalg.norm(profile.embedding))
        if norm == 0.0:
            raise ValueError("Cannot enroll zero embedding")
        normalized = (profile.embedding / norm).astype(np.float32)
        self._artists[profile.artist_id] = ArtistProfile(
            artist_id=profile.artist_id,
            display_name=profile.display_name,
            languages=profile.languages,
            licensed=profile.licensed,
            embedding=normalized,
        )

    def get(self, artist_id: str) -> Optional[ArtistProfile]:
        return self._artists.get(artist_id)

    def top_match(
        self,
        query_embedding: np.ndarray,
        *,
        threshold: float = 0.75,
    ) -> MatchResult:
        """Find the registered artist whose voiceprint best matches the query."""
        if query_embedding.shape != (192,):
            raise ValueError(
                f"Expected 192-D query embedding, got {query_embedding.shape}"
            )

        query = query_embedding / (np.linalg.norm(query_embedding) + 1e-9)

        best_id: Optional[str] = None
        best_score = -1.0
        for artist_id, profile in self._artists.items():
            score = float(np.dot(query, profile.embedding))
            if score > best_score:
                best_score = score
                best_id = artist_id

        if best_id is None or best_score < threshold:
            return MatchResult(
                artist_id=None,
                display_name=None,
                cosine=max(best_score, 0.0),
                licensed=False,
            )

        profile = self._artists[best_id]
        return MatchResult(
            artist_id=best_id,
            display_name=profile.display_name,
            cosine=best_score,
            licensed=profile.licensed,
        )

    def __len__(self) -> int:
        return len(self._artists)

    def __contains__(self, artist_id: str) -> bool:
        return artist_id in self._artists


def build_demo_registry(seed: int = 26199) -> ArtistRegistry:
    """
    Build a small, deterministic demo registry with 3 licensed artists.

    Matches the three entertainment scenarios in the generated dataset:
      - ART-HI-009 → entertainment_spoof_celebrity_dub_hi.wav  (voice_authenticity)
      - ART-EN-003 → entertainment_bonafide_studio_stem_en.wav (dubbing_verification)
      - ART-TA-014 → entertainment_spoof_artist_clone_ta.wav   (speaker_comparison)

    Real deployments populate this from the multi-tenant speaker registry
    (Person 1's ``src/speaker_registry.py``).
    """
    rng = np.random.default_rng(seed)
    registry = ArtistRegistry()

    demo_artists = [
        ("ART-HI-009", "Aarav Kapoor", ("hi", "en"), True),
        ("ART-EN-003", "Nisha Iyer", ("en", "hi"), True),
        ("ART-TA-014", "Meera Subramaniam", ("ta", "en"), True),
    ]
    for artist_id, name, langs, licensed in demo_artists:
        emb = rng.standard_normal(192).astype(np.float32)
        registry.enroll(
            ArtistProfile(
                artist_id=artist_id,
                display_name=name,
                languages=langs,
                licensed=licensed,
                embedding=emb,
            )
        )
    return registry


# Module-level default registry.
DEFAULT_REGISTRY = build_demo_registry()