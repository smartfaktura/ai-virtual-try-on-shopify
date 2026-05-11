## Reshuffle gallery image order

The current `IMAGES` array on `/showcase/brandname` (`src/pages/showcase/BrandSampleShowcase.tsx`) groups several Editorial shots in long runs (positions 15–29). Visually it starts mixed, then becomes a wall of editorial.

### Change

Reorder the `IMAGES` array so:
- Editorial and Essentials cards are **interleaved more evenly** across the full grid (no more than ~2 editorials in a row).
- Adjacent cards have **visual contrast** — alternate between flat/ghost-mannequin shots, on-model portraits, full-body movement, and mood/location editorials so the eye keeps moving.
- First row (4 cards on desktop) leads with a strong hero mix: hero portrait → ghost mannequin → editorial campaign → on-model.
- No images added or removed; only order changes.

### Out of scope

- No copy, layout, lightbox, or styling changes
- No changes to stats, hero, CTA sections
