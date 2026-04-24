

## Fix: Pre-selected Explore scene gets unchecked after picking a product

### Root cause

`src/pages/ProductImages.tsx` has two effects fighting each other:

1. **Line 277-288** — auto-adds the Discover scene to `selectedSceneIds` the moment it resolves, and records it in `autoAddedDiscoverRef` so it doesn't re-run.
2. **Line 634-645** — whenever `selectedProductIds` changes, **wipes** `selectedSceneIds` to an empty Set.

Recreate flow timing:
- Land on `/app/generate/product-images?sceneRef=…` → scene resolves → auto-added ✅
- User picks a product on Step 1 → `selectedProductIds` changes → reset effect clears the Set ❌
- `autoAddedDiscoverRef` is already set, so the auto-add effect never re-runs → Step 2 shows the pinned card **unchecked**.

### Fix

**File: `src/pages/ProductImages.tsx`**

**Change 1 — preserve the Discover scene through the product-change reset (line 634-645).**  
When wiping `selectedSceneIds` because products changed, if a `discoverScene` exists, seed the new Set with it instead of starting empty:

```ts
const next = new Set<string>();
if (discoverScene?.sceneId) next.add(discoverScene.sceneId);
setSelectedSceneIds(next);
```

Same idea for `perCategoryScenes` — if the discover scene belongs to a known category, seed that category's set with it; otherwise just leave the Map empty (the pinned card renders independently of category buckets).

**Change 2 — make the auto-add effect re-runnable (line 274-288).**  
Drop the `autoAddedDiscoverRef` early-return guard. Replace it with an idempotent check: if the scene id is already in `selectedSceneIds`, do nothing; otherwise add it. This way if some other code path clears the Set later, the next render re-adds the scene. Idempotency comes from the `has` check, so no infinite loop.

**Change 3 — also seed on the analyze-products path.**  
The "Trigger product analysis when moving from step 1 to step 2" effect (line 668+) is where category buckets get rebuilt. Audit it to ensure that when it writes default per-category selections, it does NOT remove `discoverScene.sceneId` from `selectedSceneIds`. If it currently overwrites the Set, merge instead.

### Result

- Click Recreate on Explore tile → land on Step 1 with scene already queued internally.
- Pick a product → product-change reset preserves the Discover scene (no longer wiped).
- Continue → Step 2 shows the pinned "Pre-selected from Explore" card with the **checkbox checked by default**, exactly as the user intends ("recreate this").
- User can still uncheck it or add more shots.

### Files to edit

```text
src/pages/ProductImages.tsx
```

### Out of scope

- No DB/RPC/RLS changes
- No changes to `DiscoverPreselectedCard`, the resolver, or routing
- No Step 2 grid rendering changes — only the seeded selection state

