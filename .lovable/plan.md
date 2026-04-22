

## Add outfit direction to Activewear → Creative Shots

Apply the provided outfit direction text as `outfit_hint` on all 24 scenes in the **Activewear** category, **Creative Shots** sub-category, on the `product_image_scenes` table.

### Scope
- 24 scenes total (Tennis Court, Blue Gradient Studio, Fisheye Portrait, Court Lines Golden, Studio Chair Pose, Track Field, Sunny Shadows, Geometric Blue Wall, Greenhouse Elegance, Canon G7X @Night, Urban Sunset Glow, Clean Studio Light, Pilates Studio Glow, Urban Crossroads, Subway Platform, Urban NYC Street, Skatepark Golden Hour, Urban Concrete, Translucent White Studio, Hoop Dream Sky, Sunny Morning Kitchen, Urban Concrete Canyon, Terracotta Sunset, Stadium Seating Fashion).
- 19 currently have empty `outfit_hint` → will be filled.
- 5 already have a custom `outfit_hint` (Translucent White Studio, Hoop Dream Sky, Urban Concrete Canyon, Terracotta Sunset, Stadium Seating Fashion) → **will be overwritten** with the new unified direction so the whole sub-category behaves consistently.

### Change
Single SQL migration:

```sql
UPDATE public.product_image_scenes
SET outfit_hint = '<full outfit direction text>',
    updated_at = now()
WHERE category_collection ILIKE '%activewear%'
  AND sub_category = 'Creative Shots';
```

### How it takes effect
The prompt builder (`src/lib/productImagePromptBuilder.ts → outfitDirective`) already resolves `outfit_hint` into the final prompt when present, and the Step 3 wizard auto-detects scene-controlled outfits (`allModelScenesHaveOutfitHint`) — no UI/code changes needed.

### Validation
- `/app/admin/product-image-scenes` → Activewear → Creative Shots → open any scene → **Outfit Hint** field shows the new directive.
- Run a generation with one of these scenes + a top or bottom product → outfit follows the direction (matching activewear pieces, no denim/streetwear, performance sneakers when appropriate).

### Out of scope
- Other Activewear sub-categories (Editorial Sport Poses, etc.) untouched.
- No prompt template, preview image, or scene metadata changes.
- No code or UI changes.

