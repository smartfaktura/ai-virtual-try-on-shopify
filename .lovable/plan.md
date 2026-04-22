

## Default view: Recommended carousel + full Freestyle grid

Reshape what the user sees the moment the Scene modal opens — and let admins curate per-onboarding-category recommendations.

### 1. New default layout (when no filters / search are active)

```
┌──────────────────────────────────────────────────────────┐
│ Recommended for you            ‹ ›                       │  ← carousel (12)
│ [card][card][card][card][card][card] →                   │     desktop arrows
├──────────────────────────────────────────────────────────┤
│ Freestyle Scenes                                         │  ← full grid (all)
│ [card][card][card][card]                                 │     2/3/4 cols
│ [card][card][card][card]                                 │     paginated
│ [card][card][card][card]                                 │     "Load all"
│ ...                                                      │
└──────────────────────────────────────────────────────────┘
```

- Drop the four-rail layout (Freestyle Scenes / Recommended / Product Only / With Model carousels).
- **Top:** keep `SceneCatalogRail` for **Recommended for you** only — same desktop chevron arrows already implemented, mobile keeps native swipe.
- **Below:** render the **full Freestyle grid** using the existing `SceneCatalogGrid` (paged + "Load all" + infinite scroll already work). Source: `useSceneCatalog` with `excludeEssentials: true` and no other filters → returns the entire catalog ordered by `sort_order ASC`.
- Filtering or searching collapses the recommended rail and shows just the filtered grid (today's behaviour).
- "Product Only" and "With Model" stop being default rails — they remain reachable via the top-bar chips, sidebar, and quick views.

### 2. Personalised recommendations driven by onboarding category

Today `useRecommendedScenes` blends *one* admin-curated list with the user's onboarding categories. We split that into per-category curated lists.

**DB change** — extend `recommended_scenes`:

```sql
alter table public.recommended_scenes
  add column category text;          -- nullable; matches PRODUCT_CATEGORIES.id
                                     -- ('fashion','beauty','fragrances','jewelry',
                                     --  'accessories','home','food','electronics',
                                     --  'sports','supplements', or null = global)
create index recommended_scenes_category_idx
  on public.recommended_scenes(category, sort_order);

-- Drop the old global-unique constraint, replace with per-category uniqueness
alter table public.recommended_scenes
  drop constraint recommended_scenes_scene_id_key;
alter table public.recommended_scenes
  add constraint recommended_scenes_cat_scene_uniq unique (category, scene_id);
```

`category = null` → "Global" pool (used as fallback when a user has no matching category list).

**Resolution logic in `useRecommendedScenes`:**

1. Read `profiles.product_categories` (already fetched today).
2. For each category the user picked, fetch up to 12 from `recommended_scenes` where `category = <cat>`, ordered by `sort_order`.
3. Merge in the order categories were selected, dedupe by `scene_id`, cap at 12 total.
4. If still <12 (or user has no categories / picked "any"), top up from `category IS NULL` (global list).
5. Final fallback unchanged: top-12 by `sort_order` from `product_image_scenes`.

Net effect: a Beauty user sees the 12 scenes admin curated for **Beauty**; a Fashion+Footwear user sees a merged top-12 from both lists.

### 3. Admin page: per-category curation (`/app/admin/recommended-scenes`)

Rebuild the existing page to manage **one list per onboarding category + a Global list**.

```
┌─────────────────────────────────────────────────────────────┐
│ Recommended Scenes                                          │
│ Curate per onboarding category (12 scenes recommended)      │
│                                                             │
│ Category: [ Global ▾ ]   ← tabs/select                      │
│                                                             │
│ Featured (8/12)              [Reorder ↑↓] [×]              │
│ [card][card][card][card][card][card][card][card]            │
│                                                             │
│ All scenes  [search...]            (1,613 scenes)           │
│ [card][card][card][card][card][card]                        │
│ ...                                                          │
└─────────────────────────────────────────────────────────────┘
```

- Top selector: pills/segmented control listing **Global, Fashion, Beauty, Fragrances, Jewelry, Accessories, Home, Food, Electronics, Sports, Supplements** (driven by `PRODUCT_CATEGORIES` from `categoryConstants.ts`, minus `any`).
- Selecting a category scopes everything: featured grid, add/remove, reorder, all queries filter by that category.
- Featured grid shows a `n/12` counter; warns (visual chip "Recommended cap: 12") when exceeded but does not hard-block — admins may store more if useful.
- Same arrow reorder + click-to-toggle-feature interaction as today, scoped per category.
- Independent state per category — switching tabs preserves each list.
- Works against the new `recommended_scenes.category` column (queries always pass `.eq('category', selected)` or `.is('category', null)` for Global).

### Files touched

- **DB migration** — `recommended_scenes`: add `category text`, swap unique constraint, add index.
- `src/hooks/useRecommendedScenes.ts` — per-category fetch + merge + global fallback.
- `src/components/app/freestyle/SceneCatalogModal.tsx` — replace 4-rail default layout with `Recommended` carousel + full `SceneCatalogGrid` underneath; keep filter/search behaviour.
- `src/pages/AdminRecommendedScenes.tsx` — add category selector, scope all queries/mutations by category, show `n/12` counter.

### Untouched

- `recommended_scenes` RLS (admin-only writes / authenticated reads — unchanged; new column inherits).
- Generation pipeline, sidebar, custom_scenes flow, top-bar chips, `useSceneCatalog`, `useSceneCounts`, SceneCatalogRail/Card/Grid components.
- Onboarding flow.

### Validation

- Open `/app/freestyle` Scenes modal as a Beauty user → top "Recommended for you" carousel shows the 12 scenes admin selected for Beauty; below it the full Freestyle catalog grid with "Load all".
- Same modal as a multi-category user (Fashion + Beauty) → recommended is a merged dedup of both lists, capped at 12.
- User with no `product_categories` → recommended falls back to Global list, then to top-12 by `sort_order`.
- `/app/admin/recommended-scenes` → switching the Category selector changes the featured grid and preserves each list independently. Adding a scene under "Beauty" does not affect "Fashion".
- Searching or applying any filter in the modal hides the recommended carousel and shows the filtered grid (today's behaviour preserved).

