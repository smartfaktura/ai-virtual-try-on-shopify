## Add 6 Product-Focused Dining Room Scenes

Create 6 new scenes under `furniture` → `Dining Room` that keep a fully furnished room but **strip back table clutter** so the user's selected product is the undeniable hero. Each prompt includes a new `PRODUCT HERO FOCUS` directive that reduces tableware/centerpieces to a minimum and uses lighting, framing, and negative space to draw the eye to the product.

### Scenes (sort_order 2957–2962)

1. **Limestone Arch Dining** (2957) — Pale limestone floor, double-height arched doorway, long raw-oak table with 6 slipcovered chairs. Table styled with only a linen runner and two ceramic vessels — nothing more. Warm side light pools onto the product.

2. **Charcoal Plaster Dining** (2958) — Dark charcoal microcement walls, pale oak herringbone floor, round smoked-oak table (seats 4), black cane-back chairs. Table nearly bare: a single sculptural candle holder. Moody directional spotlight isolates the product.

3. **Whitewashed Farmhouse Dining** (2959) — Whitewashed brick walls, reclaimed pine floor, long trestle table (seats 8), simple rush-seat chairs. Only a stoneware pitcher and two glasses on the table. Bright, airy north light makes the product glow.

4. **Walnut Gallery Dining** (2960) — Warm walnut-panelled wall (wainscot height), cream plaster above, polished concrete floor. Oval walnut table (seats 6), tan leather chairs. Table set with a single low ceramic bowl. Museum-like precision — the product is the exhibit.

5. **Sage & Linen Dining** (2961) — Sage green limewash walls, wide-plank white-oak floor, rectangular ash dining table, cream bouclé chairs. One folded linen napkin and a single stem vase on the table. Soft diffused daylight, calm and editorial.

6. **Raw Concrete Dining Loft** (2962) — Board-formed concrete ceiling, steel-frame Crittall windows, poured resin floor. Industrial trestle table (blackened steel + oak top), cognac leather sling chairs. Empty table surface — product commands full attention. Late afternoon sun rakes across the concrete.

### Technical details

- **Database**: 6 `INSERT` statements via the insert tool into `product_image_scenes`
- **`PRODUCT HERO FOCUS` directive** (new, added to each prompt): Instructs the model to keep the dining table surface deliberately sparse — maximum 2 small styling props — so the user's product receives 70%+ of visual attention. Lighting and depth of field bias toward the product.
- **`COMPLETE INTERIOR COMPOSITION`** retained: Room still looks fully furnished (chairs, sideboard/shelf, rug or lighting fixture, architectural details) — only the *table surface* is decluttered.
- **`PROPORTIONAL SCALE RULE`** with dining-room calibration (75cm table height, 210cm door, 175cm adult anchor, ~5m room width).
- **`NO LOGOS OR TEXT`** directive on all scenes.
- `category_collection = 'furniture'`, `sub_category = 'Dining Room'`, `scene_type = 'lifestyle'`
- `category_sort_order = 0`, `sub_category_sort_order = 0`
- No code file changes needed
