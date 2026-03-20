

# Fix: Creative Drops Scenes & Random Toggles

## Problems

1. **"Scenes" section shows workflow variations** (Front View, 3/4 Turn, Back View, Movement Shot) — these are framing/angle labels from `generation_config.variation_strategy.variations`, NOT actual scenes. They're redundant with the Framing selector and confusing for users. Some appear duplicated.

2. **"Random / Diverse" toggles exist inside Curated mode** — contradicts the purpose of Curated (manual selection). These toggles should be removed entirely: Curated = manual, Mix = random. That's already handled by the Campaign Mode selector.

3. **Scene Library only shows 4 categories** — `fashionPoses` filters to `['studio', 'lifestyle', 'editorial', 'streetwear']`, missing product categories like `clean-studio`, `surface`, `flat-lay`, `product-editorial`. Should use the full scene list like the main Generate page does.

## Changes

### File: `src/components/app/CreativeDropWizard.tsx`

**A. Remove the "Scenes" (variations) section entirely** (lines 1096-1167)
The workflow variations (Front View, 3/4 Turn, etc.) are angle instructions, not scenes. They're already handled by the Framing selector. Remove this entire block including the `sceneSelections` toggle for variations.

**B. Remove "Random / Diverse" toggles from both Models and Scenes sections** (lines 1030-1041 for models, lines 1106-1117 for scenes)
In Curated mode, the user manually picks — no random toggle needed. The Campaign Mode selector already handles the curated vs mix distinction.

**C. Replace `fashionPoses` with full scene list** (line 107-109 and line 1181)
Instead of filtering to only 4 categories, use the same approach as `Generate.tsx`:
- Import `useCustomScenes`, `useHiddenScenes`, `useSceneSortOrder` (already imported)
- Use `filterVisible(mockTryOnPoses) + customPoses` to get all scenes including custom uploaded ones
- Group by category with category labels, matching the Generate page's scene picker UI

**D. Make Scene Library the primary scene selection** (lines 1169-1217)
Rename "Scene Library" to just "Scenes". Show it whenever `showPosePicker` or `needsModels` is true (not just when `show_pose_picker` is set). This becomes the only scene selection mechanism.

**E. Update `computedImageCount`** to use `poseSelections.length` instead of `sceneSelections.size` since we're removing the variations-based scene selection.

**F. Remove `sceneSelections` state** — no longer needed since we removed the variations grid. Scene selection is now purely through `poseSelections` (the Scene Library poses).

## Summary
- 1 file changed
- Remove confusing workflow-variation "Scenes" grid
- Remove Random/Diverse toggles from Curated mode
- Show full scene library (all categories + custom scenes) as the primary scene picker
- Credit calculation uses pose selections instead of variation selections

