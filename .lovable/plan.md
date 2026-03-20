

# Fix: Personalize Creative Drops Config Per Workflow

## Problem
The wizard shows the same generic scene library for every workflow. But each workflow has its own `variation_strategy.variations` (specific scenes with preview images), and unique settings that the Generate page (`WorkflowSettingsPanel`) already supports:

- **Selfie/UGC**: Should show workflow's UGC theme scenes (not mockTryOnPoses), already has UGC Mood
- **Flat Lay**: Should show workflow's surface variations (with previews), needs Composition Style toggle (Clean/Decorated) and Styling Notes
- **Mirror Selfie**: Should show workflow's mirror environment scenes (with previews), needs Mirror Selfie tips
- **Product Listing Set**: Should show workflow's product scene variations, needs Product Angles selector
- **Picture Perspectives**: Should show workflow's angle variations (front, back, side, close-up), no models needed
- **Virtual Try-On**: Current scene library approach is fine, but should ALSO show the workflow's variation scenes

## Root Issue
The wizard uses `allScenePoses` (from `mockTryOnPoses` + custom scenes) as the scene picker for ALL workflows. Instead, workflows that have `variation_strategy.variations` should show THOSE variations as the selectable scenes (with their preview images), just like `WorkflowSettingsPanel` does.

## Changes

### File: `src/components/app/CreativeDropWizard.tsx`

**A. Add workflow type detection flags** (near line 290)
```ts
const isFlatLay = selectedWorkflow?.name?.toLowerCase().includes('flat lay');
const isMirrorSelfie = selectedWorkflow?.name === 'Mirror Selfie Set';
const isSelfieUgc = selectedWorkflow?.name?.toLowerCase().includes('selfie') || selectedWorkflow?.name?.toLowerCase().includes('ugc');
const isPerspectives = selectedWorkflow?.name?.toLowerCase().includes('perspectives');
const isProductListing = selectedWorkflow?.name?.toLowerCase().includes('product listing');
```

**B. Add missing state** (near line 205)
- `flatLayPropStyle: 'clean' | 'decorated'` (default: `'clean'`)
- `stylingNotes: string` (default: `''`)
- `selectedAesthetics: string[]` (default: `[]`)
- `productAngle: 'front' | 'front-side' | 'front-back' | 'all'` (default: `'front'`)

**C. Replace generic Scene Library with workflow variations** (lines 1096-1157)
For workflows that have `variation_strategy.variations`, show those variation cards (with their `preview_url` images) instead of `mockTryOnPoses`. Use `selectedVariationIndices: Set<number>` instead of `poseSelections`.

Only show the `mockTryOnPoses` scene library for Virtual Try-On (which benefits from the full library). All other workflows use their own variations.

The variation cards already exist in `WorkflowSettingsPanel` — reuse the same card pattern with preview images, labels, and categories.

**D. Add Flat Lay specific sections** (after scene selection)
When `isFlatLay`:
- Composition Style toggle (Clean vs Decorated) — same as WorkflowSettingsPanel lines 512-544
- Aesthetic quickchips when Decorated — same as lines 546-594
- Styling Notes textarea

**E. Add Product Angles for Product Listing Set** (after scene selection)
When `isProductListing` and not Flat Lay:
- Product Angles selector (Front Only, Front+Side, Front+Back, All Angles) with multiplier badges

**F. Add Mirror Selfie tips** (when Mirror Selfie selected)
Show the smartphone composition tips alert, same as WorkflowSettingsPanel lines 333-346.

**G. Hide models section for non-model workflows**
- Picture Perspectives, Flat Lay, Product Listing: hide models grid entirely (already handled by `needsModels` check, but ensure Flat Lay also excluded)

**H. Hide Campaign Mode for workflows without models AND without meaningful scene choice**
- Picture Perspectives: no campaign mode needed (just select angles)

**I. Update `computedImageCount`** to include `productAngle` multiplier:
```ts
const angleMultiplier = productAngle === 'all' ? 3 : productAngle === 'front' ? 1 : 2;
```

**J. Include new settings in save logic**
Store `flatLayPropStyle`, `selectedAesthetics`, `stylingNotes`, `productAngle` in `sceneConfig`.

## Summary
- 1 file changed (`CreativeDropWizard.tsx`)
- ~120 lines added (workflow-specific sections), ~40 lines modified
- Each workflow now shows its own variation scenes with preview images
- Flat Lay gets Composition Style + Aesthetics + Styling Notes
- Product Listing gets Product Angles
- Mirror Selfie gets composition tips
- Picture Perspectives shows angle variations without models

