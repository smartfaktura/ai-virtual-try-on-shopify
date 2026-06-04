## Issue
On mobile the 4:5 image fills the entire modal, pushing the title and "Use this scene" button off-screen — only "Close" is visible at the bottom.

## Fix
In `src/components/app/DashboardFreshScenes.tsx` (Dialog block):

1. **Cap image height on mobile** so title + CTA always fit:
   - Image container: `aspect-[4/5]` → `max-h-[55dvh] aspect-[4/5]` on mobile, keep `md:aspect-[4/5] md:h-[80vh] md:max-h-none`.
   - Use flex layout inside grid wrapper so image shrinks: container becomes `flex flex-col md:grid md:grid-cols-[auto_minmax(0,1fr)]`.
   - Image wrapper: `shrink-0` on mobile so it respects max-h.

2. **Keep text panel visible** with `shrink-0` and no `overflow-y-auto` swallowing the buttons. Remove inner `overflow-y-auto max-h-[…]` from the grid wrapper (DialogContent already caps height); let the image cap do the work.

3. Result: image ≤ 55dvh, title + CTA + Close fit in remaining ~30dvh.

No desktop changes.
