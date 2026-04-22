

## Remove "Other / Custom" category — fall back to Clothing & Apparel

### Problem
The "Other / Custom" category exists in the admin scene library but has no real product-category fit on the user side. When a product doesn't match any specific category, the wizard should default to **Clothing & Apparel** (the most universal scene set) instead of routing through "Other / Custom".

### Changes

**1. Data migration (single SQL UPDATE)**
Reassign every scene currently in the `other` collection to `garments` (Clothing & Apparel), preserving sub-categories, sort order, prompts, and previews:

```sql
UPDATE product_image_scenes
SET category_collection = 'garments',
    updated_at = now()
WHERE category_collection = 'other';
```

After this runs, the "Other / Custom" tab disappears from `/app/admin/product-image-scenes` automatically (the admin builds its category list from the data).

**2. Code fallback — category resolver**
Find the wizard logic that maps a product's analyzed category to a scene `category_collection` (likely in the product analysis / category normalization layer or `useProductImageScenes` consumers). Wherever the code currently resolves to `'other'` as a last-resort bucket, change it to `'garments'`.

Touchpoints to inspect & patch:
- `src/lib/categoryConstants.ts` — remove any `'other'` references / mappings
- `src/components/app/product-images/sceneData.ts` — fallback category default
- `supabase/functions/analyze-product-category/*` — if it ever returns `other`, normalize to `garments`
- Any `COLLECTION_MERGE` or category-resolver helper that funnels unknown categories into `other`

**3. Admin UI label map**
Remove `other: 'Other / Custom'` from the `TITLE_MAP` in `src/hooks/useProductImageScenes.ts` (cosmetic — no rows will reference it after step 1, but cleaner).

### Validation
- `/app/admin/product-image-scenes` → "Other / Custom" tab is gone; its scenes now appear under "Clothing & Apparel" (in their original sub-categories).
- Upload a product that doesn't match any specific category → wizard opens Clothing & Apparel scenes by default.
- Existing products / generations are unaffected (scene IDs don't change, only their parent collection).

### Out of scope
- Not deleting any scenes — just rehoming them.
- No prompt template, RLS, or schema changes.
- Per-scene `sub_category` values stay as-is (e.g. an "Other / Custom" scene called "Generic Tabletop" will appear under Clothing & Apparel with its current sub-category label — say the word if you want me to rename or merge those sub-categories too).

