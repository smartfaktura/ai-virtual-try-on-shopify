

# Insert 12 Fragrance "Ingredient Editorial" Scenes

## What
Insert 12 new still-life scenes into `product_image_scenes` under `fragrance` with a new sub-category `Ingredient Editorial` (overriding the file's split into Fruit/Floral). All are still-life editorial with no model.

## Scenes

| # | scene_id | title | sort_order |
|---|----------|-------|------------|
| 1 | crushed-citrus-fragrance | Crushed Citrus | 194 |
| 2 | orchard-spill-fragrance | Orchard Spill | 195 |
| 3 | stone-fruit-fragrance | Stone Fruit | 196 |
| 4 | pomegranate-night-fragrance | Pomegranate Night | 197 |
| 5 | fig-satin-fragrance | Fig Satin | 198 |
| 6 | pear-chrome-fragrance | Pear Chrome | 199 |
| 7 | rose-veil-fragrance | Rose Veil | 200 |
| 8 | lily-shadow-fragrance | Lily Shadow | 201 |
| 9 | iris-smoke-fragrance | Iris Smoke | 202 |
| 10 | jasmine-flash-fragrance | Jasmine Flash | 203 |
| 11 | tuberose-marble-fragrance | Marble Tuberose | 204 |
| 12 | peony-blur-fragrance | Peony Blur | 205 |

## Shared Settings
- `category_collection`: `fragrance`
- `sub_category`: `Ingredient Editorial`
- `category_sort_order`: 26
- `scene_type`: `editorial`
- `is_active`: true
- `suggested_colors`: none (null)
- `requires_extra_reference`: false
- `use_scene_reference`: false
- `trigger_blocks`: `{sceneEnvironment,layout,visualDirection}`
- `outfit_hint`: null (all 12 are still-life)

## How
Use the database insert tool to run 12 `INSERT INTO product_image_scenes (...)` statements with full prompt templates from the file.

