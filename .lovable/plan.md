

# Insert 6 Fragrance "Dream Editorial" Scenes (Fog Mauve)

## What
Insert 6 new scenes into `product_image_scenes` under `fragrance` with a **new** sub-category `Dream Editorial` (the file header specifies this, not "Conceptual Editorial"). All use "Fog Mauve" (#A18A92) as the curator color.

## Scenes

| # | scene_id | title | sort_order | has model? |
|---|----------|-------|------------|------------|
| 1 | sheer-motion-portrait-fragrance | Sheer Motion | 188 | Yes |
| 2 | mirror-blur-vanity-fragrance | Mirror Blur | 189 | Yes |
| 3 | flash-exit-portrait-fragrance | Flash Exit | 190 | Yes |
| 4 | satin-ghost-still-fragrance | Satin Ghost | 191 | No |
| 5 | soft-focus-monolith-fragrance | Soft Monolith | 192 | No |
| 6 | haze-caustic-still-fragrance | Haze Caustic | 193 | No |

## Shared Settings
- `category_collection`: `fragrance`
- `sub_category`: `Dream Editorial`
- `category_sort_order`: 25
- `scene_type`: `editorial`
- `is_active`: true
- `suggested_colors`: `[{"hex":"#A18A92","label":"Fog Mauve"}]`
- `requires_extra_reference`: false
- `use_scene_reference`: false

## Per-Scene Details
- Scenes 1–3: `trigger_blocks` include `personDetails`, `outfit_hint` populated from file
- Scene 3 also includes `actionDetails`
- Scene 2 also includes `layout`
- Scenes 4–6: still-life, `outfit_hint` null, trigger blocks include `layout`
- Full prompt templates from the uploaded file

## How
Use the database insert tool to run 6 `INSERT INTO product_image_scenes (...)` statements.

