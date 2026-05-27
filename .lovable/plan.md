## Tweak Selfie UGC section on `/showcase/bioma`

1. **Hide section header block** — remove the label "Selfie UGC set", heading "Creator-style selfies for social", and subtitle "Raw, phone-shot energy…". Keep the grid only (still rendered under same section spacing).
2. **Remove UGC images** at positions 1, 3, 9, 13, 14, 25, 26 (1-indexed in current order) — leaves 19 images.
3. **Shuffle** remaining UGC images with a fixed deterministic order (hand-picked random sequence, hardcoded) so the output is stable across renders/reloads.

No other changes (main editorial grid, hero, stats, CTA all unchanged).
