
# Update Living Room Scenes with Dimensions

## What changes

Update the 6 recently added furniture scenes in `product_image_scenes` to:

1. **Set `sub_category = 'Living Room'`** — groups them under a "Living Room" section in the scene picker
2. **Add dimensional accuracy block** to every prompt — tells the AI to respect real-world furniture dimensions (e.g. 220cm sofa) relative to room architecture references (ceiling 2.7m, door 2.1m, tiles 60cm)
3. **Add room-specific dimensions** to each scene's prompt (room size, ceiling height, window dimensions, prop sizes)

## Technical approach

Create a temporary admin edge function `admin-update-scenes` that:
- Validates the caller is an admin (checks `user_roles`)
- Uses `service_role` client to UPDATE `product_image_scenes`
- Accepts an array of `{ scene_id, sub_category, prompt_template }` objects

Then call it via `curl_edge_functions` with the 6 updated prompts, and delete the edge function afterward.

## Scenes being updated

| Scene ID | Room Dimensions |
|---|---|
| furniture-lifestyle-penthouse-panorama | 8m × 6m, 3.5m ceiling, windows 3.5m+ |
| furniture-lifestyle-ivory-boucle-salon | 6m × 5m, 3m ceiling, arches 2.4m |
| furniture-lifestyle-walnut-travertine-den | 5.5m × 4.5m, 2.8m ceiling |
| furniture-lifestyle-smoke-stone-loft | 10m × 7m, 4.5m ceiling, windows 3m+ |
| furniture-lifestyle-nordic-fjord | 6m × 5m, 2.7m ceiling, windows 2.2m × 1.8m |
| furniture-lifestyle-grand-atelier-salon | 7m × 6m, 4m+ ceiling, doors 2.8m |

All prompts will include a shared dimensional accuracy instruction block referencing standard architectural measurements for AI to calibrate product scale.
