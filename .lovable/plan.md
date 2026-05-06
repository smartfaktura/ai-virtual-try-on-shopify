## Update 12 Living Room Scenes to Full Interior Compositions

### Problem
These 12 scenes currently generate images focused on a single product in an otherwise sparse room. The AI treats the product as the "visual hero" but doesn't populate the space with complementary furniture, resulting in empty-looking interiors rather than realistic, fully furnished rooms.

### Solution
Add a `COMPLETE INTERIOR COMPOSITION` directive to each scene's `prompt_template` — the same pattern successfully used for the Home Office and Kids Room scenes. This block instructs the AI to:

1. **Build a complete room** around the product — if the user selects a sofa, the room also gets a coffee table, side tables, a rug, lamps, and wall art. If they select a coffee table, the room gets a sofa behind it, armchairs, etc.
2. **Integrate the product naturally** as part of the interior, not as a floating showpiece.
3. **Maintain correct proportional scale** for all furniture pieces relative to the room architecture.

### Scenes to Update (12 total)
1. **Penthouse Panorama Lounge** — `furniture-lifestyle-penthouse-panorama`
2. **Ivory Bouclé Salon** — `furniture-lifestyle-ivory-boucle-salon`
3. **Walnut & Travertine Den** — `furniture-lifestyle-walnut-travertine-den`
4. **Smoke & Stone Loft** — `furniture-lifestyle-smoke-stone-loft`
5. **Nordic Fjord Living** — `furniture-lifestyle-nordic-fjord`
6. **Grand Atelier Salon** — `furniture-lifestyle-grand-atelier-salon`
7. **Sunlit Marble Atrium** — `furniture-lifestyle-sunlit-marble-atrium`
8. **Coastal Breeze Salon** — `furniture-lifestyle-coastal-breeze-salon`
9. **Cloud White Gallery** — `furniture-lifestyle-cloud-white-gallery`
10. **Golden Hour Terrace Lounge** — `furniture-lifestyle-golden-terrace-lounge`
11. **Silk & Stone Residence** — `furniture-lifestyle-silk-stone-residence`
12. **Luminous Japandi Suite** — `furniture-lifestyle-luminous-japandi-suite`

### What Changes in Each Prompt
A new directive block inserted after the product fidelity line and before the scene description:

- **COMPLETE INTERIOR COMPOSITION** — Forces a fully furnished room. Provides conditional logic: if the product is a sofa, add coffee table + side tables + rug + lamps; if it's a table, add seating around it; if it's a shelf/console, show it in a room with a seating area visible, etc.
- **Replaces** the "furniture must remain the visual hero" line with "the product must be the primary focal point within a fully furnished, balanced interior."
- Keeps all existing architectural descriptions, palettes, lighting, and camera settings unchanged.

### Technical Details
- Single SQL `UPDATE` per scene via the data insert tool (not a migration — this is a data update, not a schema change).
- Each prompt_template gets the composition block injected. No code files change.
