
# Create 6 Modern Luxury Living Room Scenes

Add 6 new prompt-only scenes to the `custom_scenes` table, each designed specifically for big furniture (sofas, tables, TV units, consoles). All scenes will have detailed, editorial-quality prompt hints optimized for product photography generation.

## The 6 Scenes

1. **Penthouse Panorama Lounge** — Floor-to-ceiling windows with city skyline view, warm evening light, open-plan luxury living room with polished concrete floors and brass accents.

2. **Ivory Boucle Salon** — Bright, airy living room with off-white plaster walls, arched doorways, herringbone oak floors, soft diffused morning light, quiet luxury Mediterranean aesthetic.

3. **Walnut & Travertine Den** — Rich mid-century modern interior with walnut paneling, travertine stone accents, warm amber lighting, sculptural elements, curated art collection.

4. **Smoke & Stone Loft** — Industrial-luxe open loft with exposed steel beams, dark slate floors, moody directional lighting, charcoal concrete walls, floor-level low perspective.

5. **Nordic Fjord Living** — Scandinavian minimalist living room with light ash wood floors, pale sage walls, oversized windows framing a forest view, clean natural light.

6. **Grand Atelier Salon** — Parisian-inspired high-ceiling room with ornate moldings, dark herringbone parquet, dramatic chandelier, editorial fashion-house aesthetic.

## Technical Details

- Insert 6 rows into `custom_scenes` via database migration
- `category: 'home'`, `discover_categories: ['home']`
- `prompt_only: true` (no reference image — pure prompt generation)
- Each scene gets a detailed 80-150 word prompt hint specifying environment, lighting, materials, lens, composition, and style
- Prompt hints will include instructions to keep center clear for product placement
- `image_url` set to the existing placeholder scene image
- `created_by` set to the admin user ID from existing home scenes
