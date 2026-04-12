

# Insert 6 More Fragrance "Conceptual Editorial" Scenes

## What
Insert 6 new scenes into `product_image_scenes` under the existing `Conceptual Editorial` sub-category in `fragrance`, using the uploaded file data. These continue the numbering from the previous 6.

## Scenes to Insert

| # | scene_id | title | sort_order |
|---|----------|-------|------------|
| 1 | steel-sink-portrait-fragrance | Steel Sink | 176 |
| 2 | velvet-stair-pose-fragrance | Velvet Stair | 177 |
| 3 | flash-car-glance-fragrance | Car Glance | 178 |
| 4 | chrome-trough-still-fragrance | Chrome Trough | 179 |
| 5 | wet-stone-reflection-fragrance | Wet Stone | 180 |
| 6 | smoked-glass-table-fragrance | Smoked Table | 181 |

## Shared Settings
- `category_collection`: `fragrance`
- `sub_category`: `Conceptual Editorial`
- `category_sort_order`: 23
- `scene_type`: `editorial`
- `is_active`: true
- `suggested_colors`: `[{"hex":"#4F6666","label":"Petrol Teal"}]`
- `requires_extra_reference`: false
- `use_scene_reference`: false

## Per-Scene Details
- Scenes 1–3: `trigger_blocks` include `personDetails`, `outfit_hint` populated from file
- Scenes 4–6: still-life, `outfit_hint` null, trigger blocks include `layout` instead of `personDetails`
- Full prompt templates from the uploaded file

## How
Use the database insert tool to run 6 `INSERT INTO product_image_scenes (...)` statements.

