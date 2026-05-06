## Add New "Outdoor Furniture" Subcategory with 12 Scenes

Create a new subcategory under `furniture` called **"Outdoor Furniture"** with 12 luxury, design-forward terrace/patio scenes — all fully furnished with realistic outdoor proportions.

### Naming & Structure

- `category_collection = 'furniture'`
- `sub_category = 'Outdoor Furniture'`
- `scene_type = 'lifestyle'`
- `sort_order` range: 180–191 (clear of existing scenes)
- `category_sort_order = 0`, `sub_category_sort_order = 0`

### Prompt Architecture

Each scene will include:

- **COMPLETE OUTDOOR COMPOSITION** — conditional logic for different product types (sofa/sectional, dining table, lounge chair, side table, planter, lighting, rug, parasol/umbrella). No matter what product the user adds, the terrace will be fully furnished around it.
- **PROPORTIONAL SCALE RULE** — calibrated for outdoor spaces (typical terrace 6m × 4m to 8m × 5m). References: standard exterior door (210cm × 90cm), railing height (~100cm), planter boxes, and a 175cm standing adult as anchor.
- **NO LOGOS** directive (outdoor furniture brands, cushion tags, etc.)

### The 12 Scenes

1. **Mediterranean Stone Terrace** (180) — Warm limestone paving, bougainvillea-draped pergola, linen-draped outdoor sofa, olive tree in terracotta pot. Sea view backdrop.

2. **Brutalist Concrete Rooftop** (181) — Board-formed concrete planters, blackened steel outdoor dining set, city skyline backdrop, warm teak accents, architectural cacti.

3. **Hamptons White Porch** (182) — Wide wrap-around porch, white-painted railing, slatted teak loungers, blue-and-white striped cushions, hydrangea planters, ocean breeze light.

4. **Japandi Courtyard Deck** (183) — Smooth cedar decking, low-profile modular seating in warm gray, black river pebble border, bamboo screen, Akari-style outdoor lanterns.

5. **Tuscan Loggia Dining** (184) — Stone arched loggia, long reclaimed oak dining table (seats 8), wrought iron lanterns, vineyard view, linen table runner, terracotta accents.

6. **Tropical Resort Poolside** (185) — Travertine pool deck, daybed with canopy in natural linen, palm fronds overhead, infinity pool edge, warm sunset light.

7. **Scandi Cabin Veranda** (186) — Dark-stained timber deck, sheepskin-draped Adirondack chairs, wool blankets, log side tables, pine forest backdrop, morning mist.

8. **Desert Hacienda Patio** (187) — Stucco walls, Saltillo tile floor, wrought iron dining chairs, succulent garden, fire pit, warm desert sunset, adobe arches.

9. **Parisian Balcony Bistro** (188) — Narrow wrought iron balcony, marble-topped bistro table, two folding café chairs, window boxes with geraniums, Haussmann rooftop view.

10. **Modern Glass Pavilion** (189) — Freestanding glass-and-steel outdoor room, modular outdoor sofa in bouclé, polished concrete floor, landscape garden view, pendant lighting.

11. **Coastal Dune Deck** (190) — Bleached hardwood deck on sand dunes, rope-wrapped loungers, driftwood coffee table, sea grass planters, ocean horizon, wind-swept light.

12. **Alpine Chalet Terrace** (191) — Wide timber balcony with mountain views, chunky wooden outdoor dining table, sheepskin throws on benches, lantern lighting, snow-dusted peaks backdrop.

### Technical Details

- Database: 12 `INSERT` statements via the insert tool (data operation, not schema change)
- No code file changes needed — the existing scene loading logic already groups by `sub_category` dynamically
