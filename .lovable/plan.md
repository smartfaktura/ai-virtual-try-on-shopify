

## Make "All scenes" actually feel recommended

Two fixes layered into the default grid order. Pure ordering — no schema changes, no new queries on the hot path beyond one extra small fetch.

### New order for the default "All scenes" grid

```text
[1] Admin curated picks   (from recommended_scenes, Global + per-category, deduped)
[2] Sub-family interleaved catalog
        For each family in FAMILY_ORDER:
          round-robin 1 scene from each sub-family (category_collection)
        Then round-robin across families 2-by-2
[3] Anything left, in original sort_order
```

So the user always opens to: admin's hand-picked scenes first, then a varied mix that touches every sub-family before repeating, then the long tail.

### Implementation

**File: `src/hooks/useSceneCatalog.ts` — extend `useInterleavedSceneCatalog`**

Replace the body so it does:

1. **Fetch admin picks** (parallel with the catalog fetch):
   - `recommended_scenes` rows where `category IS NULL` OR `category = ANY(user.product_categories)`, ordered by `(category NULLS LAST, sort_order ASC)`. Cap at 60.
   - Resolve to full scene rows via `product_image_scenes WHERE scene_id IN (...) AND is_active`.
   - Preserve admin's order; dedupe by `scene_id`.

2. **Fetch catalog** (existing): up to 1,500 active non-essential scenes by `sort_order ASC`.

3. **Build sub-family-aware interleave** — new helper in `src/lib/sceneTaxonomy.ts`:
   ```ts
   interleaveByFamilyAndSubFamily(items, { familyChunk: 2, subFamilyChunk: 1 })
   ```
   - Group items by `category_collection` (sub-family) → keep sort_order within each.
   - Group sub-families by family via `CATEGORY_FAMILY_MAP`.
   - For each family, round-robin `subFamilyChunk` (=1) item from each sub-family queue until family is drained → produces that family's "interleaved-by-sub-family" list.
   - Then round-robin `familyChunk` (=2) items from each family's interleaved list, in `FAMILY_ORDER`.
   - Unknown collections appended at the end (stable).

4. **Compose final list**: `[adminPicks, ...interleavedCatalog excluding adminPick scene_ids]`. Cap nothing — feed full list as a single page.

5. **Cache key** includes `userId` so admin-pick personalisation per user is honored. Stale time 10 min unchanged.

**File: `src/lib/sceneTaxonomy.ts` — add the new helper**

Keep existing `interleaveByFamily` untouched (still used by admin tool & recommended fallback). Add `interleaveByFamilyAndSubFamily` with the two-level round-robin described above. Pure & deterministic.

**File: `src/components/app/freestyle/SceneCatalogModal.tsx`**

No render changes — `useInterleavedSceneCatalog` already feeds the grid. Just pass `userId` through (read from `useAuth` like `useRecommendedScenes` does) so the hook can fetch personalised admin picks.

### Within a single family filter (e.g., user clicks "Fashion")

When a family filter is active, the grid uses `useSceneCatalog` (paged). Add the same sub-family round-robin **client-side per page**: after fetching a page, group its rows by `category_collection` and re-emit them round-robin (1 from garments, 1 from dresses, 1 from jeans…). This makes the filtered family view also show variety across sub-families instead of clustering.

Implementation: small `interleaveBySubFamily(rows)` helper applied inside the `useSceneCatalog` `queryFn` only when `filters.family` is set and `filters.categoryCollection` is null.

### Untouched

- DB schema, RLS, `recommended_scenes` table & admin page, generation pipeline.
- `useRecommendedScenes` (sidebar "Recommended" tab keeps its richer per-onboarding-category logic).
- Sort = "Newest" still pure `created_at DESC`.
- Search / subject chip / sub-family filter → unchanged single-source query.

### Validation

- Open `/app/freestyle` → Scenes modal default view: first 8–12 cards are admin's curated picks from `/app/admin/recommended-scenes` (Global + matching user categories), in admin's saved order.
- Below that: variety mix where consecutive Fashion cards come from different sub-families (e.g. one shirt, one dress, one jacket — not three shirts in a row), then 2 from another family, then 2 from another.
- Click family **Fashion** → first row mixes garments / dresses / jeans / jackets instead of all garments.
- Click sub-family **Tops & Shirts** under Fashion → pure sort_order within that slug (no change — already tight).
- Sort = **Newest** → pure `created_at DESC` (no admin picks pinned, no interleaving).
- A user with `product_categories = ['fashion','beauty']` sees admin's `category='fashion'` + `category='beauty'` + `category IS NULL` picks at the top. A user with no categories sees only Global (`category IS NULL`) admin picks at top.
- Admin reordering a scene at `/app/admin/recommended-scenes` is reflected on the user's grid within 10 min (cache TTL).

