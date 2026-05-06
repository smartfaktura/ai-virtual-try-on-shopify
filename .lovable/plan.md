## Add 6 New Child Room Scenes

Insert 6 new design-forward, fully furnished Child Room scenes into `product_image_scenes`, following the exact pattern of existing Child Room scenes (same `COMPLETE INTERIOR COMPOSITION` with child-room product-type conditionals, `KIDS ROOM IDENTITY` cues, and `PROPORTIONAL SCALE RULE` with child-scale anchors).

### New Scenes (sort_order 166–171)

1. **Midnight Blue Adventure Room** (166) — Deep navy accent wall, natural pine bunk bed, rope ladder, canvas teepee reading nook, vintage globe, adventure-map wall art. Explorer's den for ages 5–10.

2. **Blush & Rattan Scandi Room** (167) — Dusty rose lime-wash walls, natural rattan bed frame, woven pendant lamp, a cozy sheepskin rug, wooden stacking toys, macramé wall hanging. Gentle Scandinavian warmth.

3. **Forest Green Treehouse Room** (168) — Sage green shiplap feature wall, natural birch loft bed with underneath reading nook, indoor hanging swing chair, botanical prints, woven baskets of soft toys. Whimsical woodland hideaway.

4. **Sunshine Montessori Room** (169) — Warm yellow limewash accent wall, floor-level Montessori bed frame in natural beech, low open shelving with wooden toys, a round jute rug, child-height art display rail. Independent learning space.

5. **Coastal Driftwood Room** (170) — Soft blue-gray walls, bleached driftwood-tone bed, striped linen bedding in sand and sky blue, rope-wrapped mirror, woven seagrass baskets, shell collection on a floating shelf. Seaside calm.

6. **Japandi Kids Study Nook** (171) — Warm white plaster walls, light hinoki desk and stool at child height, tatami mat reading corner with floor cushions, rice-paper pendant lamp, minimal wooden toy shelf, a small bonsai. Serene focus space.

### Technical Details

- Database: 6 `INSERT` statements via the insert tool (data operation, not schema change)
- Each prompt includes the full `COMPLETE INTERIOR COMPOSITION`, `KIDS ROOM IDENTITY`, and `PROPORTIONAL SCALE RULE` blocks with child-scale anchors
- `category_collection = 'furniture'`, `sub_category = 'Child Room'`, `scene_type = 'lifestyle'`
- `category_sort_order = 0`, `sub_category_sort_order = 0`
- No code file changes needed
