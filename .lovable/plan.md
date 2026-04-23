

## Fix: Recommended scene preselection silently failing in wizard

### Root cause

`fetchSceneById(id)` in `src/hooks/useProductImageScenes.ts` queries:

```ts
.from('product_image_scenes').eq('id', id)   // ❌ id is the UUID column
```

But every caller passes the **text `scene_id`** (e.g. `"acrylic-cube-shot"`), not the UUID. The frontend `ProductImageScene.id` is mapped from `scene_id` in `dbToFrontend()`.

Result: when a user clicks Recreate on a recommended Explore tile that lives **outside their currently-loaded scene library** (e.g. fashion user clicks a fragrance scene), the cache miss falls through to the DB fetch, which returns `null` → toast "That Explore scene is no longer available" → no preselection.

In-category scenes already work because the cache-hit path on line 122 (`allScenes.find(s => s.id === sceneRefParam)`) matches the text slug correctly.

### Change (single line)

**File:** `src/hooks/useProductImageScenes.ts`, line 71

```ts
// Before
.eq('id', id)

// After
.eq('scene_id', id)
```

Also rename the function arg for clarity: `fetchSceneById(id)` → `fetchSceneById(sceneId)`, and update the JSDoc comment on line 65–66 to say "queries by the text scene_id slug, not the UUID."

### Why this is the right fix

- All call sites already pass the text slug:
  - `ProductImages.tsx` line 142 passes `sceneRefParam` (from `?sceneRef=`, which the hook + modal both populate from `scene_id`).
  - The cache lookup right above on line 122 also uses `s.id === sceneRefParam` and `s.id` is the text slug.
- `scene_id` is unique in `product_image_scenes` (it's the canonical identifier) so `.maybeSingle()` stays correct.
- No other consumers rely on the UUID-based lookup; UUID lookups elsewhere use `.eq('id', uuid)` directly with their own queries.

### Verification after fix

- In-category recommended Explore tile → Recreate → wizard lands on Step 2 with "Pre-selected from Explore" card. ✓ (already worked via cache)
- Out-of-category recommended Explore tile → Recreate → DB fallback resolves the scene, `setInjectedScene(fe)` fires, "Pre-selected from Explore" card appears with the correct preview. ✓ (was broken, now fixed)
- Stale/inactive scene → `maybeSingle()` returns null → existing toast + URL cleanup runs as designed.

### Out of scope

- No changes to `useRecommendedDiscoverItems`, the RPC, or `Discover.tsx` — those already pass `scene_ref` correctly.
- No changes to `DiscoverDetailModal` — already passes `?sceneRef=` correctly.
- No DB or RLS changes.

