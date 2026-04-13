

# Insert 12 Caps & Hats "Aesthetic Color Film Editorial" Scenes

## Summary
Insert 12 new scenes into `product_image_scenes` under `hats-small` with a new `Aesthetic Color Film Editorial` sub-category.

## Scenes

| # | scene_id | title | sort_order | has model? |
|---|----------|-------|------------|------------|
| 1 | mirror-camera-peek-caps | Mirror Peek | 292 | Yes |
| 2 | headphones-flatlay-caps | Audio Flatlay | 293 | No |
| 3 | repeated-grid-still-caps | Grid Repeat | 294 | No |
| 4 | shadow-face-crop-hats | Shadow Crop | 295 | Yes |
| 5 | desert-lounge-widebrim-hats | Desert Lounge | 296 | Yes |
| 6 | checker-sun-stairs-hats | Sun Stairs | 297 | Yes |
| 7 | beach-portrait-crop-caps | Beach Crop | 298 | Yes |
| 8 | lounge-knit-portrait-caps | Lounge Knit | 299 | Yes |
| 9 | overhead-selfie-energy-caps | Overhead Selfie | 300 | Yes |
| 10 | coffee-run-city-look-caps | City Coffee | 301 | Yes |
| 11 | wall-shadow-brim-caps | Shadow Brim | 302 | Yes |
| 12 | minimal-styled-tabletop-caps | Styled Tabletop | 303 | No |

## Shared Settings
- **category_collection**: `hats-small`
- **sub_category**: `Aesthetic Color Film Editorial`
- **category_sort_order**: 33
- **sub_category_sort_order**: 21
- **scene_type**: `editorial`
- **is_active**: true
- **suggested_colors**: null
- **requires_extra_reference**: false
- **use_scene_reference**: false

## Per-Scene Details
- **Still-life scenes (2, 3, 12)**: trigger_blocks `{aestheticColor,sceneEnvironment,visualDirection,layout}`, no outfit_hint
- **Model scenes (1, 4–11)**: trigger_blocks `{aestheticColor,personDetails,sceneEnvironment,visualDirection,layout}`, outfit_hint populated from provided text
- All trigger_blocks include `aestheticColor` (key difference from the previous Lifestyle sub-category)
- Full prompt templates and descriptions from the user message

## How
Use the database insert tool to run 12 `INSERT INTO product_image_scenes (...)` statements.

