I found the lower section issue: the live page is using admin SEO visual overrides for `/ai-product-photography/home-furniture`, and several of those overrides point to generic home-decor/vase images instead of furniture room images. That is why the “Scene examples” section below is not matching Living Room, Bedroom, Dining, Office, Outdoor, and Hallway correctly.

Plan:
1. Keep the already-fixed “Built for every home & furniture shot” chip grid structure.
2. Update the Home & Furniture `sceneExamples` data so every lower-section card uses distinct, room-appropriate furniture images from the live scene catalog instead of repeated IDs.
3. Remove or replace the stale SEO visual overrides for this page’s `sceneExample*` slots so the component falls back to the corrected furniture-specific images.
4. Verify on mobile that the lower “Scene examples” section shows the correct categories and no generic decor images in furniture slots.

Technical scope:
- Frontend data: `src/data/aiProductPhotographyCategoryPages.ts`
- Lovable Cloud data cleanup: rows in `seo_page_visuals` for `/ai-product-photography/home-furniture` and `sceneExample*` keys only
- No new images, no layout redesign, no unrelated category changes