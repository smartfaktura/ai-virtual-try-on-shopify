## Problem

On mobile, the scene detail modal at `/product-visual-library` doesn't fit the screen — the hero image takes most of the viewport, pushing the title, description and CTA off-screen, and the user has to scroll inside the modal to find the "Create this visual" button.

Cause: in `src/components/library/SceneDetailModal.tsx` the hero uses `aspect-[4/5]` at all breakpoints. On a 360 px-wide phone that single image is ~450 px tall, which alone consumes ~60 % of the viewport before any text or CTA renders. Combined with `p-6 sm:p-8` body padding and the modal's `max-h-[90vh]` cap, the layout doesn't fit.

## Fix

Edit only `src/components/library/SceneDetailModal.tsx`:

1. **Shorter hero on mobile, original ratio on desktop.**
   Change the hero wrapper from
   ```
   relative aspect-[4/5] w-full overflow-hidden bg-muted/40
   ```
   to
   ```
   relative aspect-[16/11] md:aspect-[4/5] w-full overflow-hidden bg-muted/40
   ```
   This keeps the editorial 4:5 split layout on tablet/desktop (where the hero sits beside the body) but uses a wide ~16:11 banner on mobile so the title, badges, description and CTA fit in the visible viewport.

2. **Tighter body padding on mobile.**
   Change `p-6 sm:p-8` on the body column to `p-5 sm:p-8`, and reduce the body column gap from `gap-5` to `gap-4 sm:gap-5` so the CTA sits closer to the fold.

3. **Allow the modal to use full available height cleanly.**
   On `<DialogContent>`, change `max-h-[90vh]` to `max-h-[92dvh]` (dynamic viewport height — accounts for iOS Safari's collapsing address bar) and add `sm:max-h-[90vh]` to preserve the desktop look.

Result: on mobile, the user sees the hero, title, badges, description and the "Create this visual" CTA without scrolling. On desktop, the modal looks identical to today.

## Files

- `src/components/library/SceneDetailModal.tsx` — three small className tweaks.

No new components, no logic changes, no data changes.
