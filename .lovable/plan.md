## Improve Bedroom Scenes & Add 6 New Trending Scenes

### Part 1: Update 12 Existing Bedroom Scenes

Add `COMPLETE INTERIOR COMPOSITION` directive to all 12 scenes, forcing the AI to generate fully furnished bedrooms (nightstands, lamps, rugs, art, seating) around any selected product. Also replace "visual hero" phrasing with "primary focal point within a fully furnished, balanced interior."

**Scenes:** Linen Cloud Suite, Parisian Pied-à-Terre, Coastal Dawn Retreat, Warm Walnut Sanctuary, Scandi Hygge Nest, Terracotta & Linen Villa, Japandi Sleep Temple, Hamptons Morning Suite, Milanese Atelier Bedroom, Desert Stone Retreat, Skyline Penthouse Bedroom, Garden Conservatory Bedroom.

The directive includes conditional logic for beds, nightstands, dressers, wardrobes, chairs, rugs, and lamps — each product type gets appropriate complementary furniture.

### Part 2: Add 6 New Trending Bedroom Scenes

Based on current 2025-2026 interior design trends:

1. **Quiet Luxury Moody Suite** — Dark chocolate fluted oak paneling, warm amber velvet, brass accents. The "quiet luxury" movement.
2. **Curved Plaster Grotto** — Organic arched white lime plaster, tadelakt flooring, Mediterranean cave-like serenity. Curves-over-angles trend.
3. **Moss Green Velvet Cocoon** — Deep forest green walls, biophilic accents (pothos, botanical prints), cognac leather. Nature-immersion trend.
4. **Raw Earth Wabi-Sabi Room** — Imperfect clay plaster, reclaimed timber, mismatched vintage stools, undyed linen. Wabi-sabi movement.
5. **Warm Minimalist Loft** — Polished concrete + whitewashed brick, industrial windows, warm putty tones. Warm minimalism trend.
6. **Art Deco Revival Boudoir** — Deep emerald fluted velvet, brass sunburst mirror, chevron parquet, geometric mouldings. Neo-deco revival.

All 6 new scenes include the full `COMPLETE INTERIOR COMPOSITION` directive, `PROPORTIONAL SCALE RULE`, and rich `STYLED INTERIOR DETAILS` blocks matching the existing bedroom scene pattern.

### Technical Details
- Two `UPDATE` statements via migration: one to inject the composition block, one to fix "visual hero" phrasing across 12 scenes.
- Six `INSERT` statements for new scenes into `product_image_scenes` with `category_collection = 'furniture'`, `sub_category = 'Bedroom'`, `scene_type = 'lifestyle'`, sort_order 154-159.
- No code file changes needed.
