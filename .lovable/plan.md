
## Add "Start New" button to Step 6 results

### Current behavior
"Generate More" calls `onGenerateMore` which (per existing flow) returns to Step 1/2 with previous products, scenes, models, outfit, and details still loaded — useful for iterating, but no way to start fresh without manually clearing each step.

### Change
In `src/components/app/product-images/ProductImagesStep6Results.tsx`, add a third action button **"Start New"** alongside Generate More / Download All / View in Library. It calls a new prop `onStartNew` that fully resets the wizard state.

### Wiring
1. **Step6 component** — add `onStartNew: () => void` prop, render button (icon: `Sparkles` or `Plus`, variant `outline`) between "Generate More" and "Download All".
2. **Parent wizard** (`ProductImagesWizard.tsx` or equivalent that owns Step6) — pass `onStartNew={handleStartNew}` where `handleStartNew` resets all wizard slices (products, selectedScenes, models, outfitConfig, details, results, batchId) and navigates to Step 1. Reuse existing reset logic if present (likely there's an initial-state object or a `reset()` in the wizard store).

### UI
```
[ ↻ Generate More ]   [ ✨ Start New ]   [ 📦 Download All ]   [ ⬇ View in Library ]
```
Tooltip on Start New: "Begin a fresh project with new products"

### Files
- `src/components/app/product-images/ProductImagesStep6Results.tsx` — add prop + button
- Parent wizard file that renders Step6 (need to locate — likely `ProductImagesWizard.tsx` or `pages/app/generate/ProductImages.tsx`) — add reset handler + pass prop

### Validation
1. Generate visuals → land on Step 6 → click "Start New" → wizard returns to Step 1 with no products, no scenes, no outfit, no model selected
2. "Generate More" still preserves prior selections (unchanged)
3. Credit balance unaffected
