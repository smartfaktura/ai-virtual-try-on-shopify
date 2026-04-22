

## Copy High Heels scenes into Shoes (excluding Essential Shots)

Duplicate the 27 non-Essential-Shots scenes from `high-heels` into the `shoes` category, with renamed titles, scene_ids and sub-categories so "heel/heels" becomes "shoe/shoes".

### Scope (27 scenes across 4 sub-categories)

- **Editorial Heel Studio → Editorial Shoe Studio** (11 scenes)
- **Leg-Line Poses → Leg-Line Poses** (4 scenes — kept as-is, no "heel" wording)
- **Social Lifestyle Heel Moments → Social Lifestyle Shoe Moments** (4 scenes)
- **Luxury Still Life → Luxury Still Life** (5+ scenes — kept as-is)

Essential Shots (9 rows) are skipped — Shoes already has its own.

### How it works (single SQL INSERT … SELECT)

For each row in `high-heels` where `sub_category != 'Essential Shots'`:

1. Copy every column except `id`, `created_at`, `updated_at` (regenerated).
2. Rewrite text fields with case-preserving replacements applied in order:
   - `High Heels` → `Shoes`, `high heels` → `shoes`
   - `High Heel` → `Shoe`, `high heel` → `shoe`
   - `Heels` → `Shoes`, `heels` → `shoes`
   - `Heel` → `Shoe`, `heel` → `shoe`
   - Apply to: `title`, `description`, `prompt_template`, `sub_category`, `outfit_hint`.
3. Rewrite `scene_id`: replace `highheels` / `high-heels` / `-heel-` / `heel-` / `-heel` tokens with `shoes` / `shoe` equivalents, then prefix with `shoes-` if the resulting id collides with an existing scene_id (guaranteed unique via a `WHERE NOT EXISTS` guard + `-v2` suffix fallback).
4. Set `category_collection = 'shoes'`. Keep `sort_order`, `category_sort_order`, `sub_category_sort_order`, `trigger_blocks`, `suggested_colors`, `preview_image_url`, `is_active`, `scene_type`, `requires_extra_reference`, `use_scene_reference` identical to source.

### Validation
- `/app/admin/product-image-scenes` → Shoes: 27 new scenes appear under sub-categories "Editorial Shoe Studio", "Leg-Line Poses", "Social Lifestyle Shoe Moments", "Luxury Still Life".
- Shoes' existing "Essential Shots" and "Fashion Editorial" sub-categories are untouched.
- High Heels category is untouched (originals preserved).
- Open one new scene → title and prompt mention "shoe/shoes", not "heel/heels".

### Out of scope
- No code, schema, RLS, or UI changes.
- No deletion of source High Heels scenes.
- No edits to preview thumbnails — they're reused as-is from High Heels (you can override later in admin if desired).

