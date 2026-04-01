

# Catalog UX Overhaul — Better Loading, Multi-Model, Branded Completion

## Problems to Fix

1. **Loading state shows "Creating Anchor Images..."** — confusing internal terminology. Should show user-friendly progress like "Generating your catalog..." with a smooth animated progress bar
2. **Completion screen is bland** — no VOVV.AI branding, no way to click images to preview them, just a raw grid
3. **Model selection is single-select only** — user wants to pick multiple models (each model multiplies the shot count)
4. **Credit calculation doesn't account for multiple models** — needs to be Products × Models × Shots
5. **Error handling is minimal** — failed jobs just show a small alert, no per-image error state

## Changes

### 1. Redesign Loading/Progress State (`CatalogGenerate.tsx` lines 174–227)

- Replace "Creating Anchor Images..." / "Generating Derivative Shots..." with branded copy: **"VOVV.AI is generating your catalog..."** with a subtitle showing progress count
- Replace the raw spinner with a smoother animated progress section — subtle pulse animation on the VOVV.AI brand mark
- Show a per-product progress row (product name + status badge) instead of just a total count
- Remove the "Phase: complete" badge — replace with branded completion

### 2. Redesign Completion State (`CatalogGenerate.tsx`)

- Show a branded completion header: checkmark + "Your Catalog is Ready" + summary stats
- Make each generated image **clickable** — opens the existing `LibraryDetailModal` (or a simple `ImageLightbox` for now since these aren't yet library items)
- Add "Generate Another Set" and "View in Library" action buttons
- Add subtle VOVV.AI branding accent on the completion card

### 3. Multi-Model Selection (`CatalogStepModelsV2.tsx` + `CatalogGenerate.tsx`)

- Change `selectedModelId: string | null` → `selectedModelIds: Set<string>` (empty set = product-only mode)
- Update `CatalogStepModelsV2` to toggle models in/out of the set (multi-select with checkmarks)
- Keep "No Model — Product Only" as a toggle that clears the set
- Badge shows count: "2 selected" or "Product Only"
- Update `canStep3` validation: `modelExplicitlyChosen` remains (user clicked something)

### 4. Update Credit Calculation (`CatalogGenerate.tsx`)

- Formula becomes: `Products × max(1, Models) × Shots × 4 credits`
- Update the `totalImages` and `totalCredits` computed values
- Update `CatalogStepShots` summary display to show the full matrix

### 5. Update Generation Pipeline (`CatalogGenerate.tsx` handleGenerate + `useCatalogGenerate.ts`)

- `CatalogSessionConfig` gets `models: Array<{ id: string; profile: string; audience: ModelAudienceType; imageUrl: string | null }>` instead of single model fields
- For each product × each model, run the anchor + derivative pipeline
- If no models selected, run product-only shots once per product
- `useCatalogGenerate.ts` loops over models array in the generation pipeline

### 6. Better Error Handling

- Show per-image error indicators on the grid (red overlay with retry icon on failed slots)
- Show a more prominent error summary with credit refund confirmation
- Add a "Retry Failed" button if any jobs failed

### 7. Image Lightbox on Completion

- Import existing `ImageLightbox` component
- Wrap completion grid images to open lightbox on click
- Pass all `aggregatedImages` as the gallery array

## Files Modified

| File | Change |
|------|--------|
| `src/pages/CatalogGenerate.tsx` | Multi-model state, new credit calc, redesigned loading + completion UI, lightbox integration |
| `src/components/app/catalog/CatalogStepModelsV2.tsx` | Multi-select model grid |
| `src/components/app/catalog/CatalogStepShots.tsx` | Updated credit summary for multi-model |
| `src/hooks/useCatalogGenerate.ts` | Loop over multiple models in pipeline |
| `src/types/catalog.ts` | Update `CatalogSessionConfig` for multi-model |

## Technical Detail

- `CatalogSessionConfig.models` replaces `modelId`, `modelProfile`, `modelAudience`, `modelImageUrl` — single array of model configs (can be empty for product-only)
- Generation loop becomes: for each product → for each model (or once if empty) → anchor + derivatives
- Batch state stays flat (all jobs in one array) — the polling/progress logic doesn't change
- `ImageLightbox` already exists and accepts `images: string[]` + `initialIndex`

