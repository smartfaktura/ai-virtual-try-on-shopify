## Child Room Scenes — 6 New Entries

Based on 2026 kids room trends (warm minimalism, architectural beds, textured neutrals, sophisticated color, natural materials), I'll create 6 scenes for a new **Child Room** sub-category under `furniture`.

### The 6 Scenes

1. **Warm Oak Nursery Suite** — Natural honey oak floors, plaster walls in warm cream, large arched window. Scandinavian warmth with chunky knit textiles. Calm, gender-neutral.

2. **Sage & Plaster Playroom** — Matte sage green accent wall, smooth white plaster remaining walls, light oak herringbone floor. Earthy, grounding palette with soft linen textiles.

3. **Concrete Loft Kids Room** — Board-formed concrete feature wall, warm gray micro-cement floor, black steel window frame. Architectural, urban-industrial but softened with wool rugs.

4. **Travertine & Linen Haven** — Honed travertine accent wall panel, wide-plank bleached oak floor, linen curtains. Mediterranean warmth, tactile luxury.

5. **Cloud White Modern Nursery** — All-white matte plaster walls, pale ash timber floor, sheer curtains diffusing light. Furniture is the absolute hero — clean, serene, gallery-like.

6. **Walnut & Terracotta Retreat** — Rich walnut wood paneling on one wall, warm terracotta-tinted plaster on remaining walls, dark stained oak floor. Moody, cozy, sophisticated.

### Scaling Rules (Child Room Specific)

Every prompt will include:
- **Room dimensions**: ~4m x 3.5m, 2.7m ceiling (standard child room)
- **Proportional Scale Rule**: Product width as fraction of room width
- **Human Scale Anchor**: Reference a child (~120cm tall, age 6-8) or standard door (210cm) as invisible ruler
- **Child furniture standards**: Crib height ~90cm, toddler bed ~50cm from floor, child desk height ~55-60cm, child chair seat ~30-35cm
- **No clutter directive**: No random toys, no excessive decoration

### Technical Details

- **Table**: `product_image_scenes`
- **sub_category**: `Child Room`
- **sub_category_sort_order**: `7`
- **category_collection**: `furniture`
- **scene_type**: `lifestyle`
- **sort_order**: `160-165`
- **is_active**: `true`

Migration will INSERT 6 rows with full `prompt_template` values following the same structure as existing Home Office and Living Room scenes.
