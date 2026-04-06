

# Debug Report: Product Images Scene ↔ Settings Correlation

## Root Problem

The `ProductImageScene` type defines `triggerBlocks` as **optional** (`string[] | undefined`), but it is accessed without null-safety in **~15 places** across two files. When any scene object lacks `triggerBlocks` (e.g. from the static fallback or a DB row with an empty/null value), the code crashes with `Cannot read properties of undefined (reading 'includes'/'some')`.

## Affected Files & Locations

### 1. `src/components/app/product-images/ProductImagesStep3Refine.tsx`
**6 unsafe accesses on `selectedScenes` (the prop from parent):**
- Line 1578: `s.triggerBlocks.some(...)` — scenesNeedingModel filter
- Line 1602: `scene.triggerBlocks.some(...)` — toggleSceneExpand
- Line 1759: `s.triggerBlocks.some(...)` — productShots filter
- Line 1760: `s.triggerBlocks.some(...)` — modelShots filter
- Line 1764: `scene.triggerBlocks.some(...)` — renderSceneCardButton
- Line 1815: `scene.triggerBlocks.includes(...)` — background badge

All of these operate on the `selectedScenes` **prop**, which comes from the parent's `allScenes.filter(...)`. The `allScenes` from `useProductImageScenes` hook returns scenes with `triggerBlocks` populated from DB — but the **type** allows `undefined`, and if the hook is still loading or falls back to static data (which has NO triggerBlocks), these crash.

### 2. `src/lib/productImagePromptBuilder.ts`
**~8 unsafe accesses** at lines 527-528, 554, 561, 623, 629, 797. These fire during generation (Step 5) when building prompts. If any scene somehow has undefined triggerBlocks, generation crashes.

### 3. `src/components/app/product-images/detailBlockConfig.ts`
Already patched with `(scene.triggerBlocks || [])` — this file is safe.

## Fix Plan

### Change 1: Add null-safety to all `triggerBlocks` accesses in `ProductImagesStep3Refine.tsx`

Replace every `s.triggerBlocks.some(...)` and `s.triggerBlocks.includes(...)` with `(s.triggerBlocks || []).some(...)` / `(s.triggerBlocks || []).includes(...)` at all 6 locations.

### Change 2: Add null-safety to all `triggerBlocks` accesses in `productImagePromptBuilder.ts`

Replace every `scene.triggerBlocks.includes(...)` with `(scene.triggerBlocks || []).includes(...)` at all ~8 locations. Line 527 already assigns `const triggers = scene.triggerBlocks` — change to `const triggers = scene.triggerBlocks || []`.

### Change 3 (optional but recommended): Make `triggerBlocks` required in `ProductImageScene` type

In `src/components/app/product-images/types.ts` line 114, change `triggerBlocks?: string[]` to `triggerBlocks: string[]`. This would catch any future regressions at compile time. The `dbToFrontend` mapper always provides this field, and the static fallback would need a default `[]` added.

## Files Modified

| File | Change |
|---|---|
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Add `|| []` guard to 6 `triggerBlocks` accesses |
| `src/lib/productImagePromptBuilder.ts` | Add `|| []` guard to ~8 `triggerBlocks` accesses |
| `src/components/app/product-images/types.ts` | Make `triggerBlocks` required with default `[]` |

