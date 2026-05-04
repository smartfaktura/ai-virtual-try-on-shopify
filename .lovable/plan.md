
## Problem

When user selects "Style manually", scenes with built-in curated outfits (`outfitHint`) still show green "Curated · tap to override" badges and appear as pre-styled. Manual mode should mean manual — all scenes start unstyled, user fills in from scratch.

## Changes in `src/components/app/product-images/ProductImagesStep3Refine.tsx`

### 1. Scene source determination (line ~2912)

In the `productSceneOutfits` mapping, check if mode is manual. If manual, skip the `outfitHint` check so scenes with curated hints get `source: 'ai'` (needs styling) instead of `source: 'scene'` (curated). Only scenes where user has explicitly set `perSceneCfg` show as styled.

```
const isManual = details.outfitMode === 'manual';
// existing map...
if (!isManual && scene.outfitHint) return { scene, source: 'scene' };
```

### 2. Same fix for the top-level `sceneOutfitSource` (line ~2139)

There's an earlier computed array used for counts — apply the same logic there so `builtInCount` is 0 in manual mode and "Needs styling" badges appear correctly.

### 3. AI button visibility (line ~3044)

Currently the AI quick-apply button is hidden for `source === 'scene'`. In manual mode all scenes will be `source: 'ai'`, so the AI button will naturally appear — giving users the option to tap AI for a curated suggestion or fill in manually. No extra change needed here.

This ensures manual mode = all scenes start empty with "Needs styling" + both AI and Edit buttons visible on every scene.
