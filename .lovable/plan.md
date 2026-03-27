

# Merge Freestyle Product Scenes into Product Listing Set Workflow

## What changes

The Product Listing Set workflow scene grid currently only shows scenes from the workflow's database config (`generation_config.variation_strategy.variations`). This plan adds all Freestyle "Product" category scenes (from `mockTryOnPoses` + custom scenes) dynamically to the same grid, so new scenes added to the Freestyle library automatically appear in the workflow too.

## Prompt-only scenes

No conflict. The workflow already renders placeholder gradients for variations without `preview_url`. Prompt-only scenes will show the same placeholder in the grid and send their `promptHint` as the generation instruction — the backend never uses scene images for Product Listing Set, only the prompt text.

## Technical approach

### 1. Frontend — Merge scenes into variation grid

**`src/pages/Generate.tsx`** (~line 420-425, near `variationStrategy` usage):
- Import `mockTryOnPoses` product categories + `useCustomScenes` + `useHiddenScenes`
- Create a `mergedVariations` array that combines:
  - Original `variationStrategy.variations` from DB
  - Freestyle product scenes (`clean-studio`, `surface`, `flat-lay`, `product-editorial` categories) mapped to `WorkflowVariationItem` format: `{ label: scene.name, instruction: scene.promptHint, preview_url: scene.previewUrl, category: poseCategoryLabels[scene.category] }`
  - Deduplicate by label (if a scene name matches an existing DB variation, skip the duplicate)
- Pass `mergedVariations` to `WorkflowSettingsPanel` instead of raw `variationStrategy`

**Key mapping:**
```text
TryOnPose → WorkflowVariationItem
  name         → label
  promptHint   → instruction  
  previewUrl   → preview_url
  category     → category (via poseCategoryLabels lookup)
  promptOnly   → if true, preview_url = undefined (shows placeholder)
```

### 2. Backend — Support extra_variations

**`supabase/functions/generate-workflow/index.ts`** (~line 868-877):
- Add `extra_variations?: VariationItem[]` to `WorkflowRequest` interface
- When processing selected variations, check if an index falls beyond `allVariations.length` — if so, look it up from `body.extra_variations` array instead
- This lets the frontend send dynamic scene data without modifying the DB config

**Frontend send logic** (`src/pages/Generate.tsx` ~line 1200):
- When building the generation payload, check if any selected index maps to a dynamic scene (index >= original DB variations length)
- Include those as `extra_variations` in the request body
- Adjust `selected_variations` indices accordingly for extra variations

### 3. Pre-select scene from Discover "Recreate this"

**`src/pages/Generate.tsx`** (~line 602-625):
- Extend the `prefillSceneName` logic: after merging variations, find the matching scene by label/name and auto-add its index to `selectedVariationIndices`
- Works for both DB scenes and dynamically added Freestyle scenes

### 4. Scene count badge update

**`src/components/app/generate/WorkflowSettingsPanel.tsx`** (~line 239-243):
- The badge already reads `variationStrategy.variations.length` — since we pass merged data, count updates automatically

## Files changed

1. **`src/pages/Generate.tsx`** — Merge Freestyle product scenes into workflow variations, handle extra_variations in payload, pre-select from URL params
2. **`supabase/functions/generate-workflow/index.ts`** — Accept `extra_variations` field, resolve dynamic scene indices  
3. **`src/components/app/generate/WorkflowSettingsPanel.tsx`** — No changes needed (already renders from passed data)

## What stays the same

- DB workflow config is not modified
- Existing scene selection UI and category filters work unchanged
- Backend prompt building uses `variation.instruction` which maps directly to `promptHint`
- Free user scene limits still enforced

