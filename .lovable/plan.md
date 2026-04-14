

# Import 24 Apparel Scenes into product_image_scenes

## What This Does
Insert 24 new apparel/clothing scenes from the RTF into the `product_image_scenes` table, mapped to `category_collection = 'garments'` (which already exists as "Clothing & Apparel" with 18 scenes). The new `apparel-*` scene IDs don't conflict with existing `*-garments` IDs.

## Scene Summary (24 scenes)

| # | scene_id | Sub-Category | Type | Sort |
|---|----------|-------------|------|------|
| 1 | apparel-sunlit-studio-tailoring | Editorial Studio Looks | editorial | 2201 |
| 2 | apparel-clean-studio-fullbody | Editorial Studio Looks | editorial | 2202 |
| 3 | apparel-chair-studio-pose | Editorial Studio Looks | editorial | 2203 |
| 4 | apparel-graphic-sweatshirt-studio | Editorial Studio Looks | editorial | 2204 |
| 5 | apparel-garment-object-studio | Editorial Studio Looks | editorial | 2205 |
| 6 | apparel-studio-fisheye-streetwear | Editorial Studio Looks | editorial | 2206 |
| 7 | apparel-architectural-exterior-editorial | Elevated Location Editorial | editorial | 2207 |
| 8 | apparel-interior-windowlight-editorial | Elevated Location Editorial | editorial | 2208 |
| 9 | apparel-street-style-luxury-walk | Elevated Location Editorial | editorial | 2209 |
| 10 | apparel-resort-seaside-editorial | Elevated Location Editorial | editorial | 2210 |
| 11 | apparel-industrial-motion-editorial | Elevated Location Editorial | editorial | 2211 |
| 12 | apparel-oldmoney-outdoor-portrait | Elevated Location Editorial | editorial | 2212 |
| 13 | apparel-outfit-mirror-selfie | Everyday UGC Looks | lifestyle | 2213 |
| 14 | apparel-cafe-errand-ugc | Everyday UGC Looks | lifestyle | 2214 |
| 15 | apparel-stadium-ugc-look | Everyday UGC Looks | lifestyle | 2215 |
| 16 | apparel-street-steps-casual | Everyday UGC Looks | lifestyle | 2216 |
| 17 | apparel-home-lounge-ugc | Everyday UGC Looks | lifestyle | 2217 |
| 18 | apparel-car-sporty-ugc | Everyday UGC Looks | lifestyle | 2218 |
| 19 | apparel-super-editorial-campaign | Campaign Statement Images | campaign | 2219 |
| 20 | apparel-vintage-cinematic-campaign | Campaign Statement Images | campaign | 2220 |
| 21 | apparel-night-flash-campaign | Campaign Statement Images | campaign | 2221 |
| 22 | apparel-architectural-grand-campaign | Campaign Statement Images | campaign | 2222 |
| 23 | apparel-resort-glam-campaign | Campaign Statement Images | campaign | 2223 |
| 24 | apparel-wildcard-concept-campaign | Campaign Statement Images | campaign | 2224 |

## Mapping

- `category_collection = 'garments'` (joins existing 18 scenes)
- `category_sort_order = 22` (from the RTF)
- Sub-category sort orders: Editorial Studio Looks = 0, Elevated Location Editorial = 1, Everyday UGC Looks = 2, Campaign Statement Images = 3
- Full `prompt_template`, `trigger_blocks` array, and `outfit_hint` (none specified in this RTF, so NULL)
- All `is_active = true`

## Implementation
Use the database insert tool to run a single `INSERT INTO product_image_scenes` with all 24 rows. No code changes needed — the existing hook handles everything dynamically.

