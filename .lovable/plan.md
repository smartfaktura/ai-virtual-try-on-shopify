## Problem

In manual outfit mode, scenes that have a built-in `outfitHint` (curated styling direction) show "Needs styling" with an AI button. Clicking the AI button applies a generic category-based preset instead of the scene's own curated outfit direction. The user expects the AI button to accept/show the scene's built-in outfit hint.

## Changes

**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**

1. **Add local state** to track which scenes the user has "accepted" the curated hint for in manual mode:
   ```
   const [manualAcceptedHints, setManualAcceptedHints] = useState<Set<string>>(new Set());
   ```

2. **Update `sceneOutfitSource` and `productSceneOutfits`** logic: when a scene has `outfitHint` and is in manual mode, if its ID is in `manualAcceptedHints`, treat it as `source: 'scene'` (showing the curated green badge + hint text) instead of `source: 'ai'`.

3. **Update the AI button click handler** (~line 3049): when the scene has `outfitHint`, instead of applying `perProductPicks`, add the scene ID to `manualAcceptedHints`. This switches the scene from "Needs styling" to showing the curated look with the hint text visible.

4. **Update the X (clear) button** logic: when clearing a scene that was accepted via hint, also remove it from `manualAcceptedHints` so it goes back to "Needs styling".

The result: in manual mode, scenes with curated hints show "Needs styling" initially. Clicking AI accepts the scene's built-in direction and shows the green "Curated" badge with the outfit hint text. The user can still click Edit to override manually.
