## Image Upscaling — Results page cleanup

Scope: `/app/generate/image-upscaling` results step only. All edits in `src/pages/Generate.tsx`, gated on `isUpscale`.

### 1. Remove the top summary card
The first `Card` (lines 4646–4733) shows "Image Upscaling / Visual Type" header plus the reference thumbnail row ("Product / Enhanced to 4K / Product / Generated …"). This is noisy and irrelevant for upscaling.
- Hide this entire card when `isUpscale` is true.

### 2. Rename results section for upscaling
In the second `Card` (line 4747+):
- Heading: `Generated Images` → `Upscaled Images` when `isUpscale`.
- Subtitle: `Click images to select them` stays.
- Hide "Adjust" button (Settings step is trivial; "Start Over" stays).

### 3. Remove the "1, 2, 3 …" number badge on each image
Line 4787–4789 shows a numbered circle in the top-right of each tile when unselected. Remove the number; keep only the empty selection circle that fills with a check when selected. Applies globally (the user explicitly said no numbers, and the index is not meaningful information).

### 4. Hide "Help us improve" feedback card on upscale results
`ContextualFeedbackCard` (lines 4797–4814) — wrap render in `!isUpscale`. Upscaling is deterministic enhancement, not a creative result that benefits from feedback.

### 5. Layout polish for upscale results
- Use a tighter grid better suited to large 4K outputs: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` when `isUpscale`, instead of the dense 6-col grid (which makes upscaled images look small and "strange").
- Keep all other workflows on the current grid.

### What stays
- Toolbar (Select All, Download All, Start Over).
- "Crafted by your studio team / Saved to your library" footer + View in Library CTA.
- Floating selection bar.
- Lightbox + per-image hover actions.

### Out of scope
No backend/data-shape changes. No edits to other workflows.
