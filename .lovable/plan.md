## Add 6 New Living Room Scenes

Insert 6 new interior-design-forward, fully furnished Living Room scenes into `product_image_scenes`, following the exact pattern of existing scenes (sort_order 142-147, same `COMPLETE INTERIOR COMPOSITION` directive, dimensional accuracy block, and conditional product-type logic).

### New Scenes

1. **Terracotta Courtyard Living** (142) — Warm terracotta lime-wash walls, arched niches, reclaimed oak beams, handmade Zellige tile accents. Mediterranean warmth meets modern comfort.

2. **Midnight Velvet Drawing Room** (143) — Deep navy paneled walls, rich midnight blue velvet, antiqued brass chandelier, herringbone parquet. Moody maximalist evening atmosphere.

3. **Brutalist Concrete Salon** (144) — Board-formed concrete walls, large pivoting steel-frame windows, warm camel leather, olive linen. Raw architectural drama softened by organic textiles.

4. **Blush & Sage Garden Room** (145) — Dusty rose plaster walls, sage green linen, indoor olive tree, fluted travertine console. Soft biophilic palette with European garden-room charm.

5. **Smoked Oak Library Lounge** (146) — Floor-to-ceiling smoked oak bookshelves, cognac leather club chairs, brass reading lamps, Persian rug. Intellectual warmth, members-club ambiance.

6. **Alpine Chalet Great Room** (147) — Exposed timber A-frame ceiling, stone fireplace wall, sheepskin throws, wide-plank pine floors. Cozy mountain-lodge grandeur with natural textures.

### Technical Details

- Database: 6 `INSERT` statements via the insert tool (data operation, not schema change)
- Each prompt includes the full `COMPLETE INTERIOR COMPOSITION` conditional block, `DIMENSIONAL ACCURACY` ruler, and `PROPORTIONAL SCALE RULE`
- `category_collection = 'furniture'`, `sub_category = 'Living Room'`, `scene_type = 'lifestyle'`
- `category_sort_order = 0`, `sub_category_sort_order = 0`
- No code file changes needed
