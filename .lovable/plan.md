

## Apply remaining 4 outfit hints + verify all 17 Apparel → Creative Shots

Finish the regeneration by writing the new product-aware `outfit_hint` for the final 4 scenes that were generated but not persisted last run.

### Change
Single SQL `UPDATE` (data, not schema) on `product_image_scenes` for these 4 rows in **Garments → Creative Shots**:
- Terracotta Sunset
- Translucent White Studio
- Urban Crossroads
- Urban NYC Street

Each row gets its individually generated, scene-specific product-aware paragraph (hero piece left undescribed, conditional rules per product type, crop-top safeguard, palette + footwear logic derived from that scene, hard avoids list, single-paragraph closing line).

### Validation
- `/app/admin/product-image-scenes` → Garments → Creative Shots → all 17 scenes show a populated **Outfit Hint** following the new product-aware structure.
- Generate a crop top against `Urban NYC Street` → no blazer/sweater stacked over it.
- Generate trousers against `Translucent White Studio` → complementary top added, no second bottom.

### Out of scope
No code, no edge function, no schema, no other categories.

