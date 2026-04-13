

# Insert 6 More Fragrance "Conceptual Editorial" Scenes (Solar Amber)

## What
Insert 6 new still-life scenes into `product_image_scenes` under `fragrance` / `Conceptual Editorial`, continuing from sort_order 182–187. All use the "Solar Amber" curator color.

## Scenes

| # | scene_id | title | sort_order |
|---|----------|-------|------------|
| 1 | canyon-orb-fragrance | Canyon Orb | 182 |
| 2 | eclipse-shadow-fragrance | Eclipse Shadow | 183 |
| 3 | orchard-mirror-fragrance | Orchard Mirror | 184 |
| 4 | desert-portal-fragrance | Desert Portal | 185 |
| 5 | halo-caustic-fragrance | Halo Caustic | 186 |
| 6 | monolith-bloom-fragrance | Monolith Bloom | 187 |

## Shared Settings
- `category_collection`: `fragrance`
- `sub_category`: `Conceptual Editorial`
- `category_sort_order`: 24
- `scene_type`: `editorial`
- `is_active`: true
- `suggested_colors`: `[{"hex":"#C97A24","label":"Solar Amber"}]`
- `requires_extra_reference`: false
- `use_scene_reference`: false
- `trigger_blocks`: `{aestheticColor,sceneEnvironment,layout,visualDirection}`
- `outfit_hint`: null (all 6 are still-life)

## How
Use the database insert tool to run 6 `INSERT INTO product_image_scenes (...)` statements with full prompt templates from the file.

