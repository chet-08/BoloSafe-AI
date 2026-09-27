# Entertainment & Media Sector — BoloSafe-AI

Protects voice actors, singers, dubbing artists, and celebrities from
unauthorized AI voice cloning under the Indian Copyright Act 1957 (Sec 38B)
and WIPO WPPT.

## Files

| File | Purpose |
|---|---|
| `artist_registry.py` | Maps licensed voice artists to 192-D ECAPA-TDNN embeddings |
| `watermark_verifier.py` | Compares a stem's embedding against the registry → verdict |
| `certificate_generator.py` | Emits signed SHA-256 + HMAC provenance certificates |
| `policy.py` | Existing — converts risk signals into an `EntertainmentDecision` |
| `router.py` | Existing — adapts the shared engine dict into the policy call |
| `schemas.py` | Existing — Pydantic contract for the decision |
| `scenarios.py` | Existing — scenario IDs (`voice_authenticity`, etc.) |

## Verdicts

`watermark_verifier.verify_stem()` returns one of:

- `human_authentic` — matches the declared artist and license is valid
- `voice_theft` — matches a different registered artist than declared,
  OR matches the declared artist but no active license exists
- `synthetic_clone` — no registered artist matches above threshold
- `unknown_artist` — matches a registered artist but none was declared

## Scenarios

Matches `reports/sector_manifest.csv`:

| Scenario | Language | Label | Audio |
|---|---|---|---|
| `voice_authenticity` | hi | spoof | `data/sectors/entertainment/spoof/entertainment_spoof_celebrity_dub_hi.wav` |
| `dubbing_verification` | en | bonafide | `data/sectors/entertainment/bonafide/entertainment_bonafide_studio_stem_en.wav` |
| `speaker_comparison` | ta | spoof | `data/sectors/entertainment/spoof/entertainment_spoof_artist_clone_ta.wav` |

## Flow