

# Fix: Refine Step Not Loading Settings After Scene Migration

## Root Cause

`ProductImages.tsx` imports the **static** `ALL_SCENES` from `sceneData.ts` and uses it to resolve `selectedScenes` (line 130). But Step 2 (`ProductImagesStep2Scenes`) uses the **database-backed** `useProductImageScenes` hook, which returns scenes with proper `triggerBlocks`, `subCategory`, etc.

The static fallback scenes in `sceneData.ts` have **no `triggerBlocks` field** — so when Step 3 (Refine) receives these scenes, all block detection fails silently: no model picker, no scene settings, no expandable controls.

Additionally, after the global-scenes migration, DB scene IDs may differ from static IDs, causing `ALL_SCENES.filter(s => selectedSceneIds.has(s.id))` to return an empty array.

## Fix

**`src/pages/ProductImages.tsx`**:
1. Import and call `useProductImageScenes()` hook
2. Replace `ALL_SCENES` usage on line 130 with the hook's `allScenes`
3. Remove the static `ALL_SCENES` import (no longer needed here)
4. Pass `allScenes` to any other references that currently use `ALL_SCENES` (e.g., `getTriggeredBlocks` call)

This single change reconnects the Refine step to the live database scenes with all their `triggerBlocks`, making model pickers, scene settings, background controls, and all detail blocks load correctly again.

## Files

| File | Change |
|---|---|
| `src/pages/ProductImages.tsx` | Add `useProductImageScenes` hook, replace static `ALL_SCENES` with hook's `allScenes` for `selectedScenes` memo and `getTriggeredBlocks` calls |

