## Goal
Replace the 10 random product-shot tiles in the `/shopify-product-photography-ai` hero with a curated set of **editorial scenes from different product categories**, each labeled with its category so visitors instantly see the breadth.

## Change
Update the `tiles` array in `src/pages/seo/ShopifyProductPhotography.tsx` (lines 82-93). New lineup, one editorial scene per category, ordered for visual rhythm:

| # | Category label | Scene |
|---|---|---|
| 1 | Apparel        | Side Profile Street Study (garments) |
| 2 | Eyewear        | Beauty Closeup |
| 3 | Sneakers       | Geometric Grid Minimal |
| 4 | Bags           | Volcanic Sunset |
| 5 | Watches        | Motion Blur Watch Hero |
| 6 | Fragrance      | Eclipse Shadow |
| 7 | Activewear     | Tennis Court Baseline |
| 8 | Jewelry        | Editorial Neck Portrait |
| 9 | Beauty         | Shadow Surface Hero |
| 10 | Swimwear      | Minimal Horizon Swim Editorial |

All IDs come from real `product_image_scenes` rows (live in the scene-previews CDN), so no missing images.

## Open choice
Tile label style — pick one:
- **A. Category name** ("Apparel", "Eyewear", "Watches"…) — clean, communicates "works for every category"
- **B. Scene title** ("Side Profile Street Study"…) — more editorial/poetic but less obvious to a Shopify merchant

Default = A (category name) unless you prefer B. No other sections touched.