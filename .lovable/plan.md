

# Insert 12 Caps & Hats "Lifestyle Hat Editorial" Scenes

## Summary
Insert 12 new scenes into `product_image_scenes` under the `hats-small` category collection with a new `Lifestyle Hat Editorial` sub-category.

## Scenes

| # | scene_id | title | sort_order | has model? |
|---|----------|-------|------------|------------|
| 1 | sun-chair-still-caps | Sun Chair | 280 | No |
| 2 | brim-grip-portrait-caps | Brim Grip | 281 | Yes |
| 3 | smile-lean-portrait-caps | Smile Lean | 282 | Yes |
| 4 | blue-sky-handheld-caps | Sky Hold | 283 | No |
| 5 | courtside-crouch-caps | Court Crouch | 284 | Yes |
| 6 | flash-logo-portrait-caps | Flash Logo | 285 | Yes |
| 7 | hoodie-close-portrait-caps | Hoodie Close | 286 | Yes |
| 8 | knit-pull-play-caps | Knit Pull | 287 | Yes |
| 9 | fisheye-street-portrait-caps | Street Fisheye | 288 | Yes |
| 10 | car-side-summer-feed-caps | Car Side | 289 | Yes |
| 11 | scarf-and-shades-look-caps | Scarf Look | 290 | Yes |
| 12 | bucket-sky-grip-hats | Bucket Sky | 291 | No |

## Shared Settings
- **category_collection**: `hats-small`
- **sub_category**: `Lifestyle Hat Editorial`
- **category_sort_order**: 32
- **sub_category_sort_order**: 20
- **scene_type**: `editorial`
- **is_active**: true
- **suggested_colors**: null
- **requires_extra_reference**: false
- **use_scene_reference**: false

## Per-Scene Details
- **Still-life scenes (1, 4, 12)**: trigger_blocks `{sceneEnvironment,visualDirection,layout}`, no outfit_hint
- **Model scenes with background (2, 3, 6, 7, 8)**: trigger_blocks `{personDetails,sceneEnvironment,visualDirection,layout,background}`, outfit_hint populated
- **Model scenes without background (5, 9, 10, 11)**: trigger_blocks `{personDetails,sceneEnvironment,visualDirection,layout}`, outfit_hint populated
- Full prompt templates and descriptions from the user message

## How
Use the database insert tool to run 12 `INSERT INTO product_image_scenes (...)` statements.

