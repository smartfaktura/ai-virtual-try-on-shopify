

## Duplicate 8 editorial scenes from Clothing & Apparel into Dresses

### What I'll do
Copy 8 specific scenes from `garments` (Clothing & Apparel) into `dresses` category, placing them under the **Editorial Dress Portraits** sub-category with new unique slugs.

### Scenes to duplicate
1. Old Money Outdoor Portrait
2. Side Lean Attitude Pose
3. Super Editorial Campaign
4. Flash Night Fashion Campaign
5. Flash Glamour Portrait
6. Desert Tailored Walk
7. Luxury Door Statement
8. Power Mirror Statement Selfie

### Approach (single SQL via insert tool)
1. **Verify** exact `category_collection` for Dresses (likely `dresses`) and confirm all 8 source titles exist in `garments`.
2. **Insert** duplicates with:
   - `scene_id` = `{original_scene_id}-dresses` → guaranteed unique
   - `id` = `gen_random_uuid()`
   - `category_collection` → `'dresses'`
   - `sub_category` → `'Editorial Dress Portraits'` (overrides original sub-category)
   - All other fields copied as-is: `title`, `description`, `prompt_template`, `trigger_blocks`, `scene_type`, `preview_image_url`, `outfit_hint`, `use_scene_reference`, `requires_extra_reference`, `suggested_colors`, `is_active`, `sort_order`, `category_sort_order`, `sub_category_sort_order`

```sql
INSERT INTO product_image_scenes (
  scene_id, title, description, prompt_template, trigger_blocks,
  category_collection, sub_category, scene_type, preview_image_url,
  outfit_hint, use_scene_reference, requires_extra_reference,
  suggested_colors, is_active, sort_order, category_sort_order, sub_category_sort_order
)
SELECT
  scene_id || '-dresses',
  title, description, prompt_template, trigger_blocks,
  'dresses',
  'Editorial Dress Portraits',
  scene_type, preview_image_url,
  outfit_hint, use_scene_reference, requires_extra_reference,
  suggested_colors, is_active, sort_order, category_sort_order, sub_category_sort_order
FROM product_image_scenes
WHERE category_collection = 'garments'
  AND title IN (
    'Old Money Outdoor Portrait',
    'Side Lean Attitude Pose',
    'Super Editorial Campaign',
    'Flash Night Fashion Campaign',
    'Flash Glamour Portrait',
    'Desert Tailored Walk',
    'Luxury Door Statement',
    'Power Mirror Statement Selfie'
  );
```

### Validation
1. Pre-check query → confirm 8 source rows match exact titles in `garments` (no typos)
2. Run insert → expect exactly 8 new rows
3. Open `/app/admin/product-image-scenes` → filter Dresses → see new "Editorial Dress Portraits" sub-group with all 8 scenes
4. Source `garments` rows untouched
5. Slugs end with `-dresses` so no PK conflicts

### Notes
- Data operation only — no schema migration
- If any of the 8 titles aren't found exactly, I'll report which ones and ask before inserting
- Edits to dress-specific prompts (e.g., dress-aware styling tweaks) can be made in the admin panel afterward without affecting source garment scenes

