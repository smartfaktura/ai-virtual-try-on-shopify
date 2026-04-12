

# Insert 18 Editorial Sneaker Scenes

## Overview
Insert 18 new scenes into the `product_image_scenes` table via a database migration. These are organized into 3 sub-categories under the `sneakers` category collection:
- **Editorial Series** (6 scenes, sort 136–141, category_sort_order 15)
- **Flash Editorial** (6 scenes, sort 142–147, category_sort_order 16)
- **Brutalist Concrete** (6 scenes, sort 148–153, category_sort_order 17)

## What gets created
Each scene will have:
- All prompt templates and trigger blocks exactly as specified
- `outfit_hint` field populated with the Scene Outfit Direction text
- `suggested_colors` field with the strongest curator color as `[{hex, label}]`
- `scene_type: 'editorial'`, `category_collection: 'sneakers'`
- `is_active: true`, `requires_extra_reference: false`, `use_scene_reference: false`

## Technical details
- Single SQL migration with 18 `INSERT` statements into `product_image_scenes`
- No schema changes needed — all columns already exist
- `suggested_colors` stored as JSONB array, e.g. `'[{"hex":"#5C6B8A","label":"Slate Blue"}]'`
- Uses `ON CONFLICT (scene_id) DO NOTHING` to prevent duplicates if re-run
- Sub-category sort orders: Editorial Series = 0, Flash Editorial = 1, Brutalist Concrete = 2

## Files changed
1. New migration file — `INSERT` 18 rows into `product_image_scenes`

