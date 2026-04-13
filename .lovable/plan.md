

# Insert 12 Skirts "City Mini Editorial" Scenes

## Summary
Insert 12 new scenes into `product_image_scenes` under a new `skirts` category collection with `City Mini Editorial` sub-category.

## Scenes

| # | scene_id | title | sort_order |
|---|----------|-------|------------|
| 1 | cobblestone-walk-skirts | Stone Walk | 310 |
| 2 | wall-lean-mini-skirts | Wall Lean | 311 |
| 3 | sunlit-leg-kick-skirts | Leg Kick | 312 |
| 4 | concrete-wall-halter-skirts | Concrete Halter | 313 |
| 5 | cafe-chair-pause-skirts | Cafe Pause | 314 |
| 6 | marble-step-editorial-skirts | Marble Step | 315 |
| 7 | studio-minimal-mini-skirts | Studio Mini | 316 |
| 8 | street-crossing-mini-skirts | Street Crossing | 317 |
| 9 | sunglasses-blazer-mini-skirts | Blazer Mini | 318 |
| 10 | pleated-white-summer-skirts | Summer Pleat | 319 |
| 11 | graphic-tee-contrast-skirts | Tee Contrast | 320 |
| 12 | neutral-wall-soft-editorial-skirts | Soft Neutral | 321 |

## Shared Settings
- **category_collection**: `skirts`
- **sub_category**: `City Mini Editorial`
- **category_sort_order**: 34
- **sub_category_sort_order**: 0
- **scene_type**: `editorial`
- **is_active**: true
- **suggested_colors**: null
- **requires_extra_reference**: false
- **use_scene_reference**: false

## Per-Scene Details
- **All 12 scenes have models** — all include `personDetails` in trigger_blocks and have outfit_hint populated
- **Scenes with `background` trigger block (2, 7, 12)**: trigger_blocks include `background`
- **Scene 7**: trigger_blocks `{personDetails,visualDirection,layout,background}` (no sceneEnvironment — studio scene)
- **All others**: trigger_blocks `{personDetails,sceneEnvironment,visualDirection,layout}`
- Full prompt templates and descriptions from the user message

## How
Use the database insert tool to run 12 `INSERT INTO product_image_scenes (...)` statements.

