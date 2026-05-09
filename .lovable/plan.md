## Fix Wedding Dress category placement, label, and recommendations

Three small issues to fix:

1. **Label** — sidebar shows raw slug `wedding-dress` instead of "Wedding Dress"
2. **Wrong group** — sits at bottom on its own; should appear inside the **Fashion** family next to Dresses
3. **Not recommended** — when a user's onboarding/product is wedding-related, Wedding Dress scenes should be served by the recommended rail

All fixes are config-only — no schema or scene-data changes.

### 1. `src/lib/sceneTaxonomy.ts`

**Add to `CATEGORY_FAMILY_MAP`** (groups it under Fashion sidebar/family):
```ts
'wedding-dress': 'Fashion',
```

**Add to `SUB_FAMILY_LABEL_OVERRIDES`** (proper display label):
```ts
'wedding-dress': 'Wedding Dress',
```

**Add to `ONBOARDING_TO_COLLECTIONS_MAP`** (so users who picked fashion/dresses subniches get it in recommendations):
- Extend the existing `fashion: [...]` array with `'wedding-dress'`
- Add a dedicated entry: `'wedding-dress': ['wedding-dress']` (for users who pick that subcategory directly)
- Add `'wedding': ['wedding-dress']` and `'bridal': ['wedding-dress']` aliases

### 2. Seed `recommended_scenes` table

Insert 6 rows so `useRecommendedScenes` PASS 1 (sub-category curated) returns the new scenes when the user has `wedding-dress` in `product_subcategories`:

```sql
INSERT INTO recommended_scenes (scene_id, category, sort_order, created_by)
VALUES
  ('wedding-dress-chapel-altar',       'wedding-dress', 1, <admin uuid>),
  ('wedding-dress-garden-veil',        'wedding-dress', 2, <admin uuid>),
  ('wedding-dress-grand-staircase',    'wedding-dress', 3, <admin uuid>),
  ('wedding-dress-beach-golden-hour',  'wedding-dress', 4, <admin uuid>),
  ('wedding-dress-ballroom-portrait',  'wedding-dress', 5, <admin uuid>),
  ('wedding-dress-train-walk-away',    'wedding-dress', 6, <admin uuid>);
```

Also seed under family key for PASS 2 fallback when only family is picked:
```sql
INSERT INTO recommended_scenes (scene_id, category, sort_order, created_by)
VALUES
  ('wedding-dress-chapel-altar',       'fashion', 90, <admin uuid>),
  ('wedding-dress-garden-veil',        'fashion', 91, <admin uuid>),
  ('wedding-dress-ballroom-portrait',  'fashion', 92, <admin uuid>);
```

(Will use the first existing admin uuid from the `user_roles` table — auto-detected at insert time.)

### 3. Verify existing per-product flow already works

- `categoryUtils.detectProductCategory` already returns `'wedding-dress'` for any product with "wedding dress / bridal gown" keywords → Product Images automatically filters scenes to the new collection. No code change needed there.
- `categoryLabels['wedding-dress']` already set to "Wedding Dress".

### Out of scope
- No new SEO landing page, no Visual Library family tab override, no admin UI changes.
- Scene content / preview thumbnails unchanged (uploaded later via Bulk Preview Upload).
