

## Set accent color `#E6DDD1` on Fragrance → Conceptual Editorial + Dream Editorial scenes

Replace the `suggested_colors` value on every scene in these two sub-categories with the single accent **`#E6DDD1`** (label "Sand Linen"). This is the color shown in the picker as the curated accent next to each scene.

### Scope (21 scenes total)

**Conceptual Editorial (15)** — Eclipse Shadow, Smoked Table, Desert Portal, Monolith Bloom, Halo Caustic, Mirror Vanity, Canyon Orb, Doorway Walk, Resin Monolith, Smoked Panels, Satin Echo, Velvet Stair, Chrome Trough, Wet Stone, Orchard Mirror.

**Dream Editorial (6)** — Sheer Motion, Mirror Blur, Flash Exit, Satin Ghost, Soft Monolith, Haze Caustic.

### Change (data only — single SQL UPDATE)

```sql
UPDATE product_image_scenes
SET suggested_colors = '[{"hex":"#E6DDD1","label":"Sand Linen"}]'::jsonb,
    updated_at = now()
WHERE category_collection = 'fragrance'
  AND sub_category IN ('Conceptual Editorial','Dream Editorial');
```

This wipes the existing per-scene amber/teal/mulberry/mauve curations and replaces them with the single sand-linen accent across all 21 rows.

### Validation
- `/app/admin/product-image-scenes` → Fragrance → Conceptual Editorial: every scene's "Suggested Colors" shows one swatch `#E6DDD1` (Sand Linen).
- Same for Dream Editorial (all 6 scenes).
- Open one scene in the wizard (`/app/generate/product-images`) → the curated accent next to it is `#E6DDD1`.

### Out of scope
- Other Fragrance sub-categories (Editorial Studio, etc.) untouched.
- No prompt template, schema, code, or UI changes.
- If you also want the existing accents kept *alongside* `#E6DDD1` (instead of replaced), say so and I'll switch the SQL to append.

