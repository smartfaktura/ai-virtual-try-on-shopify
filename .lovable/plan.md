

# Insert 12 Boots "Quiet Luxury Editorial" Scenes

## Summary
Insert 12 new scenes into `product_image_scenes` under the `boots` category with a new `Quiet Luxury Editorial` sub-category.

## Scenes

| # | scene_id | title | sort_order | has model? |
|---|----------|-------|------------|------------|
| 1 | seated-trouser-drop-boots | Trouser Drop | 260 | Yes |
| 2 | white-denim-floor-crop-boots | Denim Floor | 261 | Yes |
| 3 | full-look-wall-pose-boots | Wall Pose | 262 | Yes |
| 4 | net-bag-still-boots | Net Still | 263 | No |
| 5 | bag-sunglasses-look-boots | Accessorized Look | 264 | Yes |
| 6 | crossed-leg-sofa-detail-boots | Sofa Cross | 265 | Yes |
| 7 | light-boot-pair-editorial | Light Pair | 266 | Yes |
| 8 | lineup-wardrobe-scene-boots | Lineup Scene | 267 | Yes |
| 9 | gray-block-lounge-boots | Block Lounge | 268 | Yes |
| 10 | bag-carry-street-minimal-boots | Carry Minimal | 269 | Yes |
| 11 | chair-foot-detail-boots | Chair Detail | 270 | Yes |
| 12 | loafer-wall-lean-boots | Wall Lean | 271 | Yes |

## Shared Settings
- `category_collection`: `boots`
- `sub_category`: `Quiet Luxury Editorial`
- `category_sort_order`: 23
- `sub_category_sort_order`: 20
- `scene_type`: `editorial`
- `is_active`: true
- `suggested_colors`: null
- `requires_extra_reference`: false
- `use_scene_reference`: false

## Per-Scene Details
- **Scene 4 (Net Still)**: still-life, trigger_blocks `{sceneEnvironment,visualDirection,layout}`, no outfit_hint
- **Scene 1**: trigger_blocks include `background` in addition to standard set
- **Scene 7**: trigger_blocks include `background` in addition to standard set
- **All others with models**: trigger_blocks `{personDetails,sceneEnvironment,visualDirection,layout}`, outfit_hint populated from provided text
- Full prompt templates and descriptions from the user message

## How
Use the database insert tool to run 12 `INSERT INTO product_image_scenes (...)` statements.

