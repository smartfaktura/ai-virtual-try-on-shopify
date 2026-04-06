

# Multi-Select Settings → Extra Variations

## What this changes

Currently, settings like Packaging State, Background Tone, Environment, and Surface are single-select. The user wants to select multiple values (e.g., all 3 packaging states) and have each selection generate as a separate image, with credits counting accordingly.

## Design approach

Rather than converting every `DetailSettings` field from `string` to `string[]` (which would break the entire prompt builder, review UI, and generation pipeline), we introduce a **"scene variation multiplier"** system. Specific fields are marked as multi-selectable, and the generation loop expands each combination into separate jobs.

## Changes

### 1. Add `MultiChipSelector` component
**File:** `ProductImagesStep3Refine.tsx`

A new component alongside `ChipSelector` that stores selections as comma-separated strings (e.g., `"sealed,open,both"`). This avoids changing the `DetailSettings` type from `string` to `string[]`.

- Visually identical to `ChipSelector` but allows multiple active chips
- Shows a small `+N` badge when multiple are selected

### 2. Convert these fields to multi-select
**File:** `ProductImagesStep3Refine.tsx` (BlockFields function)

| Field | Block | Current | New behavior |
|---|---|---|---|
| `packagingState` | packagingDetails | single | multi-select, each value = extra image |
| `backgroundTone` | background (per-scene) | single | multi-select for per-scene tone |
| `environmentType` | sceneEnvironment | single | multi-select (bathroom + kitchen = 2 images) |
| `surfaceType` | sceneEnvironment | single | multi-select |

The global `BackgroundSwatchSelector` stays single-select (it sets the default for all scenes). Multi-select only applies within a scene's expanded panel.

### 3. Update credit calculation
**File:** `ProductImagesStep3Refine.tsx` + `ProductImagesStep4Review.tsx`

Currently: `totalImages = productCount × sceneCount × imgCount`

New: For each scene, count the variation multiplier from multi-select fields. A scene with 3 packaging states selected = 3× images for that scene.

Add a helper: `getSceneMultiplier(sceneId, details) → number` that parses comma-separated multi-select fields relevant to that scene's `triggerBlocks` and returns the product of their counts.

### 4. Update generation loop
**File:** `ProductImages.tsx` (`handleGenerate`)

When iterating scenes, expand multi-select fields into separate jobs. For each scene, compute the combinations from its multi-select fields and create one job per combination, each with the specific value injected into the prompt.

```
// Pseudocode
for scene of selectedScenes:
  variations = expandMultiSelects(scene, details)  // e.g., [{packagingState:'sealed'}, {packagingState:'open'}]
  for variation of variations:
    for i of imgCount:
      enqueue job with merged details
```

### 5. Update prompt builder
**File:** `productImagePromptBuilder.ts`

No changes needed — `buildDynamicPrompt` already reads single values from `details`. The generation loop will pass a copy of `details` with the specific single value for each variation.

### 6. Update sticky bar credit display
**File:** `ProductImagesStickyBar.tsx`

Pass the new multiplier-aware total into the sticky bar so the credit count updates live as users toggle multiple options.

## Files

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | Add `MultiChipSelector`, convert 4 fields, add `getSceneMultiplier` helper, update credit calc |
| `ProductImagesStep4Review.tsx` | Update total image/credit calculation to use multiplier |
| `ProductImages.tsx` | Expand generation loop to create separate jobs per multi-select combination |
| `ProductImagesStickyBar.tsx` | Accept multiplier-aware totals |

