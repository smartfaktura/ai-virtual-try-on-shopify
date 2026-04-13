

# Update 12 Existing Fragrance Scenes (Improved Prompts)

## What
Update the 12 existing `Ingredient Editorial` scenes (sort_order 194–205) with improved prompt templates and descriptions from the uploaded file. The file also changes the sub-category name to `Scent Notes Editorial`.

## Changes Per Scene

All 12 scenes get updated `description` and `prompt_template` fields. The `sub_category` changes from `Ingredient Editorial` to `Scent Notes Editorial` for all 12.

| # | scene_id | Updated description |
|---|----------|-------------------|
| 1 | crushed-citrus-fragrance | Cinematic citrus still life with fresh torn texture. |
| 2 | orchard-spill-fragrance | Sunlit fruit composition with natural editorial chaos. |
| 3 | stone-fruit-fragrance | Moody fruit still life with warm cinematic depth. |
| 4 | pomegranate-night-fragrance | Dark glossy scene with dramatic seed reflections. |
| 5 | fig-satin-fragrance | Soft fabric and fruit composition with elegant mood. |
| 6 | pear-chrome-fragrance | Minimal reflective scene with modern editorial tension. |
| 7 | rose-veil-fragrance | Soft floral atmosphere with cinematic diffusion. |
| 8 | lily-shadow-fragrance | Minimal floral scene with strong shadow play. |
| 9 | iris-smoke-fragrance | Dark floral scene with subtle haze. |
| 10 | jasmine-flash-fragrance | Flash-lit floral scene with sharp contrast. |
| 11 | tuberose-marble-fragrance | Luxury minimal floral scene with marble surface. |
| 12 | peony-blur-fragrance | Selective focus floral scene with soft foreground blur. |

## How
Use the database insert tool to run 12 `UPDATE` statements on `product_image_scenes`, matching by `scene_id`, updating `description`, `prompt_template`, and `sub_category` for each row.

