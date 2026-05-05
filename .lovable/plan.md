## Update home-decor Front View scene with real-world scale logic

Update the `front-view-home` scene's `prompt_template` in the `product_image_scenes` table to include dimension-aware scale directives using `{{specification}}`.

### Database update

Update `product_image_scenes` where `scene_id = 'front-view-home'` with a new prompt that:

1. References `{{specification}}` for real-world dimensions
2. Adds REAL-WORLD SCALE (CRITICAL) block with proportional frame-fill guidelines:
   - Large items (e.g. 45 cm vase) fill ~80-85% frame height
   - Medium items (e.g. 15 cm candle) fill ~50-55% frame height  
   - Small items (e.g. 8 cm object) fill ~30-35% frame height
3. Enforces strict front view, centered, no perspective shift
4. Requires physically accurate material rendering (ceramic, wood, fabric, metal, glass, wax)
5. Uses the same structure as the existing `furniture-front-view` prompt

### Technical details

- Single UPDATE on `product_image_scenes` table via service_role
- No schema changes needed
- The update replaces the existing simple packshot prompt with the dimension-aware version
