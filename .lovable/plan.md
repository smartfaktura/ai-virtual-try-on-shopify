

# Insert 6 Eyewear "Editorial Eyewear Portraits" Scenes

## What
Insert 6 new scenes into `product_image_scenes` under `eyewear` with a new sub-category `Editorial Eyewear Portraits`.

## Scenes

| # | scene_id | title | sort_order | has model? |
|---|----------|-------|------------|------------|
| 1 | beauty-closeup-oversized-eyewear | Beauty Closeup | 230 | Yes |
| 2 | lip-touch-eyewear-portrait | Lip Touch | 231 | Yes |
| 3 | handheld-frame-closeup | Handheld Frame | 232 | Yes |
| 4 | sun-shadow-eyewear-still | Sun Shadow | 233 | No |
| 5 | chair-eyewear-still | Chair Still | 234 | No |
| 6 | sleek-black-eyewear-portrait | Sleek Black | 235 | Yes |

## Shared Settings
- `category_collection`: `eyewear`
- `sub_category`: `Editorial Eyewear Portraits`
- `category_sort_order`: 28
- `scene_type`: `editorial`
- `is_active`: true
- `suggested_colors`: null
- `requires_extra_reference`: false
- `use_scene_reference`: false

## Per-Scene Details
- Scenes 1-3 and 6: trigger_blocks include `personDetails` and `background`, outfit_hint populated from file
- Scene 4: still-life, trigger_blocks `{sceneEnvironment,visualDirection,layout,background}`, no outfit_hint
- Scene 5: still-life, trigger_blocks `{sceneEnvironment,visualDirection,layout}`, no outfit_hint
- Full prompt templates and descriptions from the uploaded file

## How
Use the database insert tool to run 6 `INSERT INTO product_image_scenes (...)` statements.

