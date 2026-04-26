## Problem

On `/product-visual-library`, when a scene card is clicked the `SceneDetailModal` shows white bands above and below the image on mobile. Cause: the mobile hero uses `aspect-[3/4]` with `object-contain`, which letterboxes the image and exposes the white modal background.

## Fix (single file: `src/components/library/SceneDetailModal.tsx`)

1. **Hero image fills its frame on every viewport** — switch className from `object-contain md:object-cover` to plain `object-cover`. No more letterbox bands.
2. **Use a single, friendlier aspect ratio across breakpoints** — replace `aspect-[3/4] max-h-[55dvh] md:aspect-[4/5]` with `aspect-[4/5]`. Slightly less tall on mobile, prevents the modal from feeling oversized while keeping the visual generous.
3. **Tighten the modal size on mobile** — change `DialogContent` `max-w-3xl` → `max-w-[26rem] sm:max-w-2xl md:max-w-3xl`, and `max-h-[92dvh]` → `max-h-[88dvh]`. Smaller, more pop-in.
4. **Move overflow scrolling inside the grid wrapper** — `DialogContent` becomes `overflow-hidden` (so the rounded corners clip cleanly) and the inner grid gets `overflow-y-auto`. Eliminates any scroll-track artifact at the modal edge.

No other layout, copy, or behavior changes.

## Out of scope

- The body panel (badges, title, description, CTA) — untouched
- Desktop split layout — already cover-based, looks correct
- Scene grid, hooks, navigation logic — untouched
