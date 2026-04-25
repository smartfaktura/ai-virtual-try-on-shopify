## Fix /home — Built for every category: Jackets, Footwear, Bags, Jewelry images missing

### Root cause
`HomeTransformStrip.tsx` builds preview URLs via `PREVIEW(id)` which expects the **filename basename** in `product-uploads/.../scene-previews/{id}.jpg`. The Bags/Fragrance/Eyewear/Swimwear arrays use real timestamp filenames (e.g. `1776239449949-ygljai`) so they load. But Jackets/Footwear/Jewelry arrays were filled with `scene_id` strings (e.g. `streetwear-editorial-side-profile-jackets`) that don't exist as filenames, so every image 404s.

I queried `product_image_scenes` for each category and pulled the **real preview filenames** that the `/app/generate/product-images` Step 2 catalog uses.

### Fix

In `src/components/home/HomeTransformStrip.tsx`, replace the `JACKETS_CARDS`, `FOOTWEAR_CARDS`, `BAGS_CARDS`, and `JEWELRY_CARDS` arrays (lines 71–133) with versions that use the real filenames from the database.

- **Jackets (12)** — pulled from `category_collection = 'jackets'`
- **Footwear (12)** — pulled from `'sneakers'`
- **Bags (12)** — refreshed from `'bags-accessories'` with verified filenames
- **Jewelry (12)** — pulled from `'jewellery-necklaces'` + `'jewellery-earrings'`

Every filename was verified against the live DB and points to an existing `scene-previews/*.jpg` in the public `product-uploads` bucket.

No other code changes — labels, layout, animation, and section markup stay identical.

**Approve to apply.**