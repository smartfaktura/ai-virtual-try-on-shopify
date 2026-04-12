

# Insert 6 New Fragrance "Conceptual Editorial" Scenes

## What
Insert 6 new scenes into `product_image_scenes` under category `fragrance` with a new sub-category `Conceptual Editorial`, using the exact data from the uploaded `.txt` file.

## Scenes to Insert

| # | scene_id | title | sort_order |
|---|----------|-------|------------|
| 1 | veil-portrait-fragrance | Veil Portrait | 170 |
| 2 | mirror-vanity-fragrance | Mirror Vanity | 171 |
| 3 | doorway-walk-fragrance | Doorway Walk | 172 |
| 4 | resin-monolith-fragrance | Resin Monolith | 173 |
| 5 | smoked-panels-fragrance | Smoked Panels | 174 |
| 6 | satin-echo-fragrance | Satin Echo | 175 |

## Shared Settings for All 6
- `category_collection`: `fragrance`
- `sub_category`: `Conceptual Editorial`
- `category_sort_order`: 22
- `scene_type`: `editorial`
- `is_active`: true
- `suggested_colors`: `[{"hex":"#7A556A","label":"Mulberry Smoke"}]`
- `requires_extra_reference`: false
- `use_scene_reference`: false

## Per-Scene Details
- **trigger_blocks**: as specified per scene (scenes 1-3 include `personDetails`; scenes 4-6 are still-life)
- **outfit_hint**: populated for scenes 1-3, null for scenes 4-6
- **prompt_template**: full prompt text from the file
- **description**: from the file

## How
Use the database insert tool to run 6 `INSERT INTO product_image_scenes (...)` statements with all the values from the uploaded file.

