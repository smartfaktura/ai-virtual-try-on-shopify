## Add 6 New Hallway Scenes

Insert 6 new design-forward, fully furnished Hallway scenes into `product_image_scenes`, following the exact pattern of existing Hallway scenes (same `COMPLETE INTERIOR COMPOSITION` with product-type conditionals, `PROPORTIONAL SCALE RULE`, and styled interior details).

### New Scenes (sort_order 166–171)

1. **Brutalist Concrete Entry** (166) — Board-formed concrete walls, blackened steel console, large round convex mirror, polished concrete floor with brass inlay strip. Raw architectural drama with warm leather and wool accents.

2. **Japandi Genkan Hallway** (167) — Light hinoki wood step-up entry, woven rush bench, slim floating shelf in pale ash, rice-paper wall sconce, stone tray for shoes. Serene ritual of arrival.

3. **Warm Terracotta Corridor** (168) — Terracotta lime-wash walls, reclaimed oak console with iron ring pulls, hand-forged iron mirror frame, sisal runner, clay pendant light. Mediterranean farmhouse warmth.

4. **Art Deco Emerald Foyer** (169) — Deep emerald lacquered walls, fluted brass console, fan-shaped sunburst mirror, geometric terrazzo floor in cream and emerald, velvet bench. 1930s glamour revived.

5. **Sage & Limestone Mudroom** (170) — Sage green shiplap wainscoting, limestone flagstone floor, built-in bench with linen cushion, iron coat hooks, woven basket storage, arched mirror. Modern English country.

6. **Midnight Velvet Gallery Hall** (171) — Deep charcoal walls, narrow gallery-style corridor with brass picture lights illuminating framed artwork, slim walnut console, velvet runner in deep plum, antiqued brass umbrella stand. Museum-like sophistication.

### Technical Details

- Database: 6 `INSERT` statements via the insert tool (data operation, not schema change)
- Each prompt includes the full `COMPLETE INTERIOR COMPOSITION` conditional block (console/mirror/bench/coat rack/rug/lamp variants) and `PROPORTIONAL SCALE RULE`
- `category_collection = 'furniture'`, `sub_category = 'Hallway'`, `scene_type = 'lifestyle'`
- `category_sort_order = 0`, `sub_category_sort_order = 0`
- No code file changes needed
