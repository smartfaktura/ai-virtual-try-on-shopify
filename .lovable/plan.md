## Fix awkward thumbnail + pulsing Layers badge stack in `/app/perspectives` generating view

The current header puts a 16×16 thumbnail of the source image with a 6×6 `Layers` badge clipped into its bottom-right corner. The badge overlaps the photo's face and competes with the title's own "Creating More Angles…" affordance — visually noisy.

### Fix

In `src/pages/Perspectives.tsx` (the generating-view header, ~lines 550–566):

- Drop the overlay badge entirely.
- Keep a single clean source thumbnail: 64×64 rounded square, soft border, `object-cover`.
- While generation is in flight, wrap it in an animated focus ring (a `ring-2 ring-primary/30` plus a separate pulsing halo via `absolute inset-0 rounded-2xl ring-2 ring-primary/40 animate-ping`) so the "working" signal lives around the image instead of stamped on top of it. Halo disappears once `genAllDone`.
- Fallback (no source URL) keeps the existing `Layers` icon tile — unchanged.

No copy changes, no changes to results grid, polling, or any other section. Pure presentational tweak to one block (~15 lines).

### Files touched

- `src/pages/Perspectives.tsx` — replace the thumbnail+badge block with the cleaner ring-halo version.
