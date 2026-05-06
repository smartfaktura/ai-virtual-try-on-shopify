## Add New "Dining Room" Subcategory with 6 Scenes

Create a new subcategory under `furniture` called **"Dining Room"** with 6 luxury, design-forward fully furnished dining scenes. Each adapts to any product type (dining table, chairs, sideboard, lighting, rug, tableware display).

### Scenes (sort_order 192–197)

1. **Warm Travertine Dining Hall** (192) — Honed travertine floor, arched alcove, long oak farmhouse table (seats 8), linen-upholstered chairs, brass chandelier, terracotta accents.

2. **Midnight Lacquer Dining Room** (193) — Deep charcoal lacquered walls, smoked oak parquet, round walnut pedestal table, emerald velvet chairs, antiqued brass candelabra, moody maximalist.

3. **Scandi Birch Dining Nook** (194) — Light birch flooring, warm white walls, round birch dining table (seats 6), woven paper-cord chairs, linen pendant lamp, minimalist ceramics.

4. **Mediterranean Courtyard Dining** (195) — Open-air courtyard with limestone floor, long reclaimed teak table under a vine-draped pergola, rush-seat chairs, terracotta tableware, olive tree.

5. **Brutalist Concrete Dining Loft** (196) — Board-formed concrete walls, steel-frame windows, live-edge walnut slab table on blackened steel legs, cognac leather chairs, industrial pendant lights.

6. **Blush & Fluted Stone Dining** (197) — Dusty rose plaster walls, fluted travertine dining table, cream bouclé chairs, brass arc floor lamp, dried pampas centerpiece, soft biophilic palette.

### Technical Details

- Database: 6 `INSERT` statements via the insert tool
- Each prompt includes `COMPLETE INTERIOR COMPOSITION` (conditional for dining table / chair / sideboard / lighting / rug / tableware), `PROPORTIONAL SCALE RULE` with dining-room calibration (standard table heights, chair dimensions, room ~5m×4m), and `NO LOGOS` directive
- `category_collection = 'furniture'`, `sub_category = 'Dining Room'`, `scene_type = 'lifestyle'`
- `category_sort_order = 0`, `sub_category_sort_order = 0`
- No code file changes needed
