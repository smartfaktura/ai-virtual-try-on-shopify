

# Fix: Freestyle Items Show "Freestyle" Instead of Dynamic Names in Library

## Problem
When opening a freestyle image from the Library page, the heading shows just "Freestyle" instead of resolved names like "Freya · Relaxed Seated". This works correctly on the Freestyle page because it builds a dynamic label inline, but the Library's data hook (`useLibraryItems.ts`) just sets `label: 'Freestyle'` as fallback.

The model/scene names ARE already resolved (lines 156-157, stored as `modelName`/`sceneName`), but they're never used to build the `label`.

## Fix

### `src/hooks/useLibraryItems.ts` (lines 151-166)

Replace the simple `'Freestyle'` fallback with dynamic label building using the already-resolved `modelInfo` and `sceneInfo`, plus product name:

```tsx
// Before
const displayLabel = wfLabel || 'Freestyle';

// After  
const modelInfo = resolveModel((f as any).model_id);
const sceneInfo = resolveScene((f as any).scene_id);
const nameParts = [modelInfo.name, sceneInfo.name].filter(Boolean);
const freestyleLabel = nameParts.length > 0
  ? nameParts.join(' · ')
  : (userPrompt ? userPrompt.slice(0, 40) + (userPrompt.length > 40 ? '…' : '') : 'Freestyle Creation');
const displayLabel = wfLabel || freestyleLabel;
```

This reuses the same logic already working on the Freestyle page. The `modelInfo`/`sceneInfo` resolution calls need to move above this line (they're currently below it — just reorder).

One file, ~5 lines changed.

