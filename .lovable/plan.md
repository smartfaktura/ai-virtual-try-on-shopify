Remove the tiny slide-number badge (the "4" chip in the top-right) from the Product Swap card on `/app/workflows`.

### Change
- In `src/components/app/WorkflowAnimatedThumbnail.tsx`, delete the slide-label chip block I added in `CarouselThumbnail` (the `scene.slideLabels[current]` overlay).
- In `src/components/app/workflowAnimationData.tsx`, drop the now-unused `slideLabels: ['1', …, '5']` from the `'Product Swap'` scene. The 5-image carousel + "Same Scene" / "Any Product" badges stay.

Scope: 2 files, frontend only.