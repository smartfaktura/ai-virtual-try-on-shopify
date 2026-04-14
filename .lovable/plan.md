

# Import 24 Activewear Scenes from RTF

## What This Does
Insert 24 new activewear scenes into the `product_image_scenes` table via the database insert tool. All scenes are mapped to `category_collection = 'activewear'` with `category_sort_order = 25`. The existing 21 activewear scenes remain untouched since the new scene IDs don't conflict.

## Data Summary

| # | scene_id | Sub-Category | Type | Sort |
|---|----------|-------------|------|------|
| 1 | activewear-editorial-floor-pose | Editorial Sport Poses | editorial | 2501 |
| 2 | activewear-editorial-standing-elongation | Editorial Sport Poses | editorial | 2502 |
| 3 | activewear-editorial-chair-core-pose | Editorial Sport Poses | editorial | 2503 |
| 4 | activewear-editorial-windowlight-pilates | Editorial Sport Poses | editorial | 2504 |
| 5 | activewear-editorial-body-detail-crop | Editorial Sport Poses | editorial | 2505 |
| 6 | activewear-editorial-balance-pose | Editorial Sport Poses | editorial | 2506 |
| 7 | activewear-gym-mirror-ugc | Gym / Court / Outdoor UGC | lifestyle | 2507 |
| 8 | activewear-court-sports-ugc | Gym / Court / Outdoor UGC | lifestyle | 2508 |
| 9 | activewear-outdoor-wellness-ugc | Gym / Court / Outdoor UGC | lifestyle | 2509 |
| 10 | activewear-cafe-errand-sport | Gym / Court / Outdoor UGC | lifestyle | 2510 |
| 11 | activewear-travel-sport-ugc | Gym / Court / Outdoor UGC | lifestyle | 2511 |
| 12 | activewear-studio-corner-ugc | Gym / Court / Outdoor UGC | lifestyle | 2512 |
| 13 | activewear-flatlay-set-neat | Product Flat Lay / Gear Still | stilllife | 2513 |
| 14 | activewear-gear-tray-still | Product Flat Lay / Gear Still | stilllife | 2514 |
| 15 | activewear-bedside-soft-still | Product Flat Lay / Gear Still | stilllife | 2515 |
| 16 | activewear-product-hanger-still | Product Flat Lay / Gear Still | stilllife | 2516 |
| 17 | activewear-shoes-mat-still | Product Flat Lay / Gear Still | stilllife | 2517 |
| 18 | activewear-wellness-objects-still | Product Flat Lay / Gear Still | stilllife | 2518 |
| 19 | activewear-powderblue-portrait | Aesthetic Color Sport Sets | editorial | 2519 |
| 20 | activewear-powderblue-court-story | Aesthetic Color Sport Sets | editorial | 2520 |
| 21 | activewear-powderblue-soft-gym | Aesthetic Color Sport Sets | editorial | 2521 |
| 22 | activewear-powderblue-flatlay-story | Aesthetic Color Sport Sets | stilllife | 2522 |
| 23 | activewear-powderblue-ugc-mirror | Aesthetic Color Sport Sets | lifestyle | 2523 |
| 24 | activewear-powderblue-hero-finisher | Aesthetic Color Sport Sets | campaign | 2524 |

## Implementation

1. **Use the database insert tool** to run a single `INSERT INTO product_image_scenes` statement with all 24 rows, including full `prompt_template`, `trigger_blocks` array, `outfit_hint`, `sub_category`, `sub_category_sort_order` (0-3 for the 4 groups), and `is_active = true`.

2. **No code changes needed** — the existing `useProductImageScenes` hook and `buildCollections()` function already handle dynamic categories from the database. The TITLE_MAP in the hook already has an `activewear` entry mapped to "Activewear & Sportswear".

3. **No migration needed** — this is a data insert, not a schema change.

## Sub-Category Sort Orders
- Editorial Sport Poses → `sub_category_sort_order = 0`
- Gym / Court / Outdoor UGC → `sub_category_sort_order = 1`
- Product Flat Lay / Gear Still → `sub_category_sort_order = 2`
- Aesthetic Color Sport Sets → `sub_category_sort_order = 3`

