## Plan

The blur halo around the preview image in the Library scene detail modal comes from a low-quality placeholder painted behind the sharp image with `blur-xl scale-105`. Because its parent has no `overflow-hidden`, the blur bleeds past the image bounds and reads as a blurry halo even after the sharp image loads.

### Change
File: `src/components/app/DiscoverDetailModal.tsx`

Remove the LQIP `<img>` block (lines 241-248) inside the left image showcase. `ShimmerImage` already handles its own loading state, so no placeholder is needed.

Also drop the now-pointless 24px right-edge gradient seam (lines 262-265) — it was paired with the LQIP to soften the blur halo into the panel and is unnecessary without it.

### Scope
- One file. Presentation-only.
- No changes to layout, modal behavior, data, or routing.
- Affects every consumer of `DiscoverDetailModal` (Discover, Library, Dashboard).

### Risk
None. Removes two visual layers; sharp image continues to render via `ShimmerImage`.