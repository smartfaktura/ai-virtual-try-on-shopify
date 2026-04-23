

## Fix: "More like this" shows wrong scenes for recommended-scene tiles

### Root cause

When a user opens a recommended-scene modal (e.g. "Dynamic Water Splash — Fragrance"), the related-items resolver in `src/pages/Discover.tsx` (and the same logic in `src/pages/PublicDiscover.tsx`) skips the strong "same scene" fast-path because that branch is gated to `selectedItem.type === 'preset'`. It falls into `scoreSimilarity`, which does three weak things:

1. Compares `category` — but recommended scenes carry the **family id** (`cosmetics`, `accessories`), not the actual collection (`fragrance`, `lipstick`). So a fragrance bottle and a lipstick both score as a category match.
2. Adds a +3 "scene-to-scene" bonus regardless of sub-category — pulls in unrelated scenes from the same family.
3. Adds up to +4 from raw description keyword overlap — descriptions for "Worn Portrait" share generic words ("light", "studio", "model"), so portrait scenes leak into a fragrance result set.

The result: a fragrance bottle modal shows lipsticks and worn-portrait women.

### What changes

**File: `src/pages/Discover.tsx`** (and mirror in `src/pages/PublicDiscover.tsx`)

1. **Extend the "same scene" fast-path to recommended scenes.**  
   Recommended-scene tiles carry `scene_ref` (the `product_image_scenes.scene_id`). When the selected item is a recommended scene, first return all OTHER items that share the same `scene_ref` or whose preset `scene_name` matches the scene's title. This guarantees direct variants of the same scene rank first.

2. **Tighten `scoreSimilarity` to use `subcategory` / `category_collection`, not the family id.**  
   - Read `(item.data as any).subcategory` and `(item.data as any).discover_categories[1]` (the collection slug, e.g. `fragrance`) when comparing.
   - Same collection: +5. Same family but different collection: +0 (was +2). This stops lipsticks from matching fragrances.
   - Drop the unconditional +3 scene-to-scene bonus; replace with +3 only when collections also match.
   - Cap description-keyword contribution at +1 (was +4) and require ≥2 overlapping keywords before any points apply. Keyword noise is the main reason worn-portrait scenes leak in.
   - Add a small +2 boost when `workflow_slug` equals `product-images` on both sides AND collections match.

3. **Hard floor on the result.**  
   After scoring, only keep items with `score ≥ 4` (was `> 0`). Below 4 means "barely related" and is the source of the visible noise. If fewer than 3 survive, fall back to "same collection only" rather than dropping the threshold.

4. **No DB or RPC changes.** All data needed (`subcategory`, `discover_categories`, `scene_ref`) is already on the items.

### Result (verified against the screenshot scenario)

Opening "Dynamic Water Splash — Fragrance":
- Fast-path returns other recommended fragrance scenes that share the same `scene_ref` family (e.g. other fragrance hero shots, "Sable Veil") — all bottle / fragrance product visuals.
- Lipstick presets fall out (different `category_collection`).
- "Worn Portrait" portraits fall out (different collection + keyword cap removes accidental overlap).
- Stays at up to 9 tiles, falls back gracefully when fewer related items exist.

### Files to edit

```text
src/pages/Discover.tsx              — relatedItems block + scoreSimilarity
src/pages/PublicDiscover.tsx        — mirror the same logic
```

### Out of scope

- No DB / RLS / RPC changes
- No changes to DiscoverDetailModal, recommended hook, or routing
- No changes to the main grid sort or category filters

