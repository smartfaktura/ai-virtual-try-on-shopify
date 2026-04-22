

## Set accent color `#E6DDD1` on Beauty & Skincare → Aesthetic Color Skincare Stories scenes

Replace the `suggested_colors` value on every scene in this sub-category with the single accent **`#E6DDD1`** (label "Sand Linen").

### Change (data only — single SQL UPDATE)

```sql
UPDATE product_image_scenes
SET suggested_colors = '[{"hex":"#E6DDD1","label":"Sand Linen"}]'::jsonb,
    updated_at = now()
WHERE category_collection = 'beauty-skincare'
  AND sub_category = 'Aesthetic Color Skincare Stories';
```

### Validation
- `/app/admin/product-image-scenes` → Beauty & Skincare → Aesthetic Color Skincare Stories: every scene's "Suggested Colors" shows one swatch `#E6DDD1` (Sand Linen).

### Out of scope
- Other Beauty & Skincare sub-categories untouched.
- No prompt template, schema, code, or UI changes.

