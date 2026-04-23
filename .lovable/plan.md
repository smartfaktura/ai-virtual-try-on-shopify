

## Fix: Recreate from Explore — never block on category-scoped scene_ref

### Root cause

The Aloe Essence Bag preset's `scene_ref = "botanical-oasis-10"` is real and active in `product_image_scenes`, but it's scoped to a `category_collection` that doesn't match the user's product. The wizard's `useProductImageScenes` is called with `priorityCategories` matching the product, so `botanical-oasis-10` isn't in `allScenes` — exact-id lookup fails and the toast fires.

User feedback: when recreating from Explore, it's **fine** to show a scene outside the recommended category. The category filter shouldn't gate Recreate.

### Fix — `src/pages/ProductImages.tsx` (sceneRef branch, ~lines 110–125)

Convert hard-fail into a DB fallback, and surface the scene even if it's outside the user's category:

1. **Try exact match** in `allScenes` first (fast path).
2. **On miss**, call `fetchSceneById(sceneRef)` (already exported from `useProductImageScenes`) — direct DB lookup, ignores category filter.
3. If found:
   - Convert via `dbToFrontend` and use it directly as the selected scene.
   - Inject it into the local scene set (or pass it through state) so Step 2 / Review can render its title, preview, and prompt template without the wizard treating it as "missing".
   - Optional soft toast: *"Showing this Explore shot — it's outside your product's usual category, but it'll work."* (low-key, no blocker.)
4. **Toast only on true DB miss** (returns null) — meaning the scene was actually deleted.

### Wizard integration

The wizard's scene picker, prompt builder, and review step all read from the merged `allScenes` array. To support an out-of-category injected scene:

- Hold the fetched scene in a `useState<ProductImageScene | null>` (e.g. `injectedScene`).
- When present, merge it into the working scene list passed to Step 2 and downstream steps so it renders, is selectable, and has a prompt template.
- The existing title/preview/promptTemplate on the DB row is enough — no extra resolution needed.

### Behaviour after fix

- Click Recreate on Aloe Essence Bag → wizard loads with bag product → `botanical-oasis-10` not in filtered set → `fetchSceneById` finds it → injected as selected scene → wizard proceeds normally with the exact scene the user picked from Explore.
- Truly archived scenes (rare) → toast + Step 2.

### File touched

```text
EDIT  src/pages/ProductImages.tsx
        - Replace hard-stop sceneRef block (~lines 110-125) with:
          1) exact match in allScenes (fast path)
          2) await fetchSceneById(sceneRef) → dbToFrontend → inject as selected scene
          3) toast only on true DB null
        - Add small useState to hold injected out-of-category scene and merge it
          into the scene set consumed by Step 2 / Review.
```

### Out of scope
- DB cleanup of duplicated `botanical-oasis-N` rows.
- Changes to `useProductImageScenes` hook (reuses existing `fetchSceneById` export).
- No layout, styling, or memory changes.

