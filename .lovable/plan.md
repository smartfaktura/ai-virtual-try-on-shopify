

## Field-by-field audit: Recommended → Explore tile

Verifying every Discover field is populated correctly for all ~497 unique scenes.

### Required Discover fields (from `DiscoverItem` of `type: 'scene'`)

| # | Field | Why it matters | Source | Coverage |
|---|---|---|---|---|
| 1 | **`poseId`** (React key) | Uniqueness + dedupe | `'rec-' + scene_id` | 100% — namespaced, no collisions with `mock-*` / `custom-*` / preset UUIDs |
| 2 | **`name`** (title shown on card + detail) | Card label, page title, SEO | `product_image_scenes.title` | 100% — verified non-null in DB for all 648 starred rows |
| 3 | **`description`** (detail modal copy) | Detail drawer subtitle | `product_image_scenes.description` | 100% — populated for all rows |
| 4 | **`previewUrl`** (tile image) | The visual itself — required | `product_image_scenes.preview_image_url` | 100% — all 648 rows have it |
| 5 | **`category`** (family chip) | Top-level filter (Fashion, Footwear…) | derived from `category_collection` → family slug via `onboardingTaxonomy` | 100% — every `category_collection` maps cleanly |
| 6 | **`subcategory`** (sub-chip) | Sub-filter (Garments, Sneakers…) | `product_image_scenes.category_collection` | 100% — same value the wizard uses today |
| 7 | **`discover_categories`** (chip membership) | Lets the tile show under both family + sub-chip | `[familyId, category_collection]` | 100% — synthesized in the hook |
| 8 | **`scene_ref`** (Recreate target) | One-click "Pre-selected from Explore" in the wizard | `recommended_scenes.scene_id` (= `product_image_scenes.scene_id`) | 100% — canonical scene id, exact match |
| 9 | **`created_at`** (sort key) | "Newest" ordering in feed | `recommended_scenes.created_at` | 100% — DB default |
| 10 | **`tags`** (filter chips on detail) | Optional secondary tags | empty `[]` (filter_tags is empty across the dataset) | N/A — feed handles missing tags gracefully |

### Recreate flow — confirmed wiring

```text
Tile click
  → DiscoverDetailModal opens (uses item.name, item.description, item.previewUrl)
  → "Recreate" button → /app/generate/product-images?sceneRef={scene_ref}&fromDiscover=1
  → ProductImages.tsx resolver fetches the scene by scene_id
  → Step 2 renders the polished "Pre-selected from Explore" card
```

`scene_ref` carries the exact `scene_id` the wizard already resolves — same code path proven for hand-curated presets.

### Where each field surfaces in the UI

```text
Explore grid card           → previewUrl, name, category chip
Explore detail modal/page   → name, description, previewUrl, tags, category, subcategory
"Recreate" button           → scene_ref → wizard pre-select
Family/sub-chip filter      → category, subcategory, discover_categories
Saved items + view counts   → poseId (= "rec-{scene_id}") as stable key
Hidden by admin             → poseId via existing useHiddenScenes filter
```

### Distribution by family (≈ 497 unique tiles after dedupe)

| Family | Sub-types covered | Tiles |
|---|---|---|
| Fashion | garments, hoodies, dresses, jeans, jackets, activewear, swimwear, lingerie, streetwear | ~140 |
| Footwear | shoes, sneakers, boots, high-heels | ~60 |
| Bags & Accessories | bags, backpacks, wallets, belts, scarves, hats | ~80 |
| Watches | watches | 18 |
| Eyewear | eyewear | 18 |
| Jewelry | rings, necklaces, earrings, bracelets | ~50 |
| Beauty & Fragrance | beauty, makeup, fragrance | ~50 |
| Home | home decor, furniture | ~25 |
| Tech | tech | 12 |
| Food & Drink | food, beverages, snacks | ~50 |
| Wellness | supplements | 12 |

### Edge cases & guarantees

- **Inactive scenes** → filtered by join (`is_active = true`) — never appear.
- **Scene deleted** → join drops the row — no orphan tile, no broken Recreate.
- **Admin un-stars** → tile disappears within cache window (≤10 min, or instant on hard refresh).
- **Same scene starred under multiple admin categories** → deduped by `scene_id`; surfaces under all relevant chips via `discover_categories`.
- **Title clash with hand-curated preset** → existing `presetTitles` Set in feed skips the recommended copy.
- **Public anon access** → new `SECURITY DEFINER` RPC mirrors `get_public_custom_scenes()` — only returns active rows.

### What's NOT auto-populated (intentional)

- **`tags`** — `filter_tags` is empty in the source dataset. Tiles show no tag chips on the detail modal. Acceptable: tags are decorative, not required for filter or Recreate. If desired later, we can backfill from category + sub-category.
- **`workflow_slug` / `workflow_name`** — these are preset-only fields. Scene tiles route through the standard Product Images wizard; no workflow override needed.
- **`model_image_url` / `model_name` / `product_image_url`** — only used by hand-curated presets to lock identity. Recreate-from-scene leaves the user free to pick their own product/model in the wizard, which is the intended UX.

### Files to ship (unchanged from prior plan)

```text
NEW   src/hooks/useRecommendedDiscoverItems.ts   – auth feed: join + dedupe + map
EDIT  src/pages/Discover.tsx                      – 1-line merge into allItems
EDIT  src/pages/PublicDiscover.tsx                – call new RPC + 1-line merge
SQL   create get_public_recommended_scenes()      – SECURITY DEFINER, active-only
```

### Bottom line

Every required Discover field — title, description, preview image, family chip, sub-chip, recreate target, sort timestamp, stable key — is populated from existing canonical data. Optional `tags` is the only blank, by design. Ready to ship on approval.

