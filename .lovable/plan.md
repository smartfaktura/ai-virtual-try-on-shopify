## 1. Animate Product Swap card on `/app/workflows`

Currently the Product Swap card on the Workflows grid uses its single `preview_image_url` (white bottle). Add a 5-image carousel using the uploaded yacht-deck scenes, with a small slide-number label ("1", "2", …) overlaid on the thumbnail.

### Steps
- Copy 5 uploaded bikini scenes to `public/images/product-swap/`:
  - `scene-1.jpg` (lavender)
  - `scene-2.jpg` (brown)
  - `scene-3.jpg` (green)
  - `scene-4.jpg` (blue crochet)
  - `scene-5.jpg` (black ribbed)
- Add `'Product Swap'` entry to `workflowScenes` in `src/components/app/workflowAnimationData.tsx`:
  - `mode: 'carousel'`, `interval: 1800`
  - `backgrounds: [scene-1…5]` — wrapped in `getOptimizedUrl({ quality: 60 })` like other carousels
  - `slideLabels: ['1','2','3','4','5']`
  - Two persistent badges: "Same Scene" and "Any Product" with `Sparkles` / `Layers` icons (matches sibling cards)
- Extend `CarouselThumbnail` in `src/components/app/WorkflowAnimatedThumbnail.tsx` to render `scene.slideLabels?.[current]` as a small chip in the top-right (rounded-full, white/blur background, text-[10px] font-semibold) when `slideLabels` is provided. Hidden in `modalCompact`.

### Notes
- Images are large source files; will be served from `/public/images/product-swap/` and routed through `getOptimizedUrl` (already pipes through the resize/quality service so payload stays small).
- Object position `center` works for all 5 scenes (consistent framing).

## 2. Fix search border clipping on `/app/product-swap`

The page wrapper uses `overflow-x-clip` (line 569), which crops the input's focus ring at the left edge. Adding vertical padding alone (`py-1`) doesn't help horizontal clipping.

### Fix
- Wrap both search rows (Step 1 scene picker line 632, Step 2 products picker line 722) with horizontal `px-1` so the focus ring/border has breathing room before being clipped by `overflow-x-clip`.
- Also nudge the `Search` icon to `left-[18px]` to stay visually centered after the input gets the extra padding.

### Scope
- 2 files: `WorkflowAnimatedThumbnail.tsx`, `workflowAnimationData.tsx`, `ProductSwap.tsx`, plus 5 image copies. Frontend only.
