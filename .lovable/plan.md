
## Make manual mode truly empty + add per-scene AI pick

### Problem
When switching to "Style manually", all scenes auto-fill with preset values, defeating the purpose. Reset also re-applies presets. User needs to see which scenes are unconfigured.

### Changes in `ProductImagesStep3Refine.tsx`

**1. Stop auto-picking presets when in manual mode**
- In the auto-pick `useEffect` (~line 2058): add guard `if (details.outfitMode === 'manual') return;` so it only auto-fills for AI mode
- When user switches TO manual mode (the `onClick` at ~line 2799): clear `outfitConfigByScene` to `{}` so all scenes show as empty/needing styling

**2. Reset all → truly empty**
- Change `handleResetAllOutfits` to set `outfitConfigByScene: {}` (empty object) instead of re-applying presets
- Change toast to "Cleared all outfit settings"

**3. Show Reset all button always in manual mode** (not just when custom exists)
- Change condition from `sceneOutfitSource.some(s => s.source === 'custom')` to just `true` when manual — always show it so user can clear anytime. Disable it when already empty.

**4. Add "AI pick" pill on each scene row**
- Next to the "Edit" button, add a small `Sparkles` pill button "AI" that auto-assigns the preset for that single scene without opening the dialog
- Clicking it applies `perProductPicks[productId].config` to that scene's `outfitConfigByScene` entry
- Only show when scene has no config (`!perSceneCfg`) and `source !== 'scene'` (not built-in)

### Files
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`
