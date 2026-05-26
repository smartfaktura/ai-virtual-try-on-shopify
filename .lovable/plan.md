## Minimalist source thumbnail in `/app/perspectives` generating view

Remove the pulsing ring/halo entirely. Just show a clean 64×64 rounded thumbnail of the source image — nothing else.

### Change

In `src/pages/Perspectives.tsx` (header block, ~lines 551–568):

- Drop the `animate-ping` halo span and the conditional `ring-2 ring-primary/30`.
- Render a single static `64×64` rounded square: `rounded-2xl`, `border border-border`, `object-cover`.
- Keep the fallback `Layers` icon tile unchanged for the no-source case.

The progress bar and "Creating More Angles…" copy already communicate that work is in progress — no extra animation on the thumbnail needed.

### Files touched

- `src/pages/Perspectives.tsx` — one block, ~12 lines simplified.
