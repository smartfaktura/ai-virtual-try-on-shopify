In `src/features/brand-scenes/wizard/steps/Step5Review.tsx`, tighten `ReferenceSummary`:

- Replace the full-bleed `aspect-[4/5]` reference image with a compact header row: a small 64×80 thumbnail on the left, scene name + tiny "Reference" eyebrow on the right (single row, no full-width image).
- Drop the big `text-base font-semibold tracking-tight` for the scene name — use `text-sm font-medium` instead so it no longer dominates the column.
- Keep "Extra direction" and "Outfit direction" blocks beneath, unchanged in structure but rendered with the existing small body type.
- Card padding stays `p-4` (slightly tighter than `p-5`) for the right-column context.

No other files touched. The picking-phase 2-column layout from the previous change stays as-is — this just shrinks what renders inside the right column.
