

# Insert 24 Eyewear Scenes Across 4 New Sub-Categories

## Summary
Insert 24 new scenes into `product_image_scenes` under the `eyewear` category, organized into 4 new sub-categories parsed from the uploaded RTF file.

## Sub-Categories and Scenes

### Sub-Category 1: Aesthetic Color Editorial (category_sort_order: 29, sub_category_sort_order: 20)
6 scenes with `suggested_colors: [{"hex":"#7A556A","label":"Mulberry Smoke"}]` (matching the aesthetic color pattern):

| # | scene_id | title | sort_order | has model? |
|---|----------|-------|------------|------------|
| 1 | aesthetic-beauty-closeup-eyewear | Beauty Closeup | 236 | Yes |
| 2 | golden-hour-aesthetic-eyewear | Golden Hour | 237 | Yes |
| 3 | editorial-office-flash-eyewear | Office Flash | 238 | Yes |
| 4 | interior-lounge-selfie-eyewear | Lounge Selfie | 239 | Yes |
| 5 | aesthetic-car-still-eyewear | Car Still | 240 | No |
| 6 | sunlit-minimal-still-eyewear | Minimal Still | 241 | No |

### Sub-Category 2: Vintage Film Editorial (category_sort_order: 29, sub_category_sort_order: 21)
6 scenes, no suggested_colors, no aestheticColor trigger block:

| # | scene_id | title | sort_order | has model? |
|---|----------|-------|------------|------------|
| 1 | vintage-flash-candy-closeup | Flash Candy | 242* | Yes |
| 2 | vintage-taxi-night-eyewear | Taxi Night | 243* | Yes |
| 3 | vintage-cafe-eyewear | Cafe Film | 244* | Yes |
| 4 | vintage-bedroom-flash-eyewear | Bedroom Flash | 245* | Yes |
| 5 | vintage-office-eyewear | Office Film | 246* | Yes |
| 6 | vintage-night-portrait-eyewear | Night Film | 247* | Yes |

*Note: The RTF file does not specify sort_order for Vintage Film scenes. I will assign 242-247 continuing from the Aesthetic Color Editorial group.

### Sub-Category 3: Brutalist UGC Editorial (category_sort_order: 30, sub_category_sort_order: 22)
6 scenes:

| # | scene_id | title | sort_order |
|---|----------|-------|------------|
| 1 | concrete-stair-selfie-eyewear | Stair Selfie | 242 |
| 2 | glass-elevator-portrait-eyewear | Elevator Glass | 243 |
| 3 | stone-wall-mirror-vibe-eyewear | Stone Mirror | 244 |
| 4 | steel-bench-side-portrait-eyewear | Bench Side | 245 |
| 5 | window-corner-closeup-eyewear | Window Corner | 246 |
| 6 | parking-deck-full-look-eyewear | Deck Look | 247 |

### Sub-Category 4: Color Vintage Editorial (category_sort_order: 31, sub_category_sort_order: 23)
6 scenes:

| # | scene_id | title | sort_order |
|---|----------|-------|------------|
| 1 | candy-flash-portrait-eyewear | Candy Flash | 248 |
| 2 | sunset-drive-eyewear | Sunset Drive | 249 |
| 3 | retro-dessert-table-eyewear | Dessert Table | 250 |
| 4 | hotel-bed-flash-eyewear | Hotel Flash | 251 |
| 5 | retro-office-story-eyewear | Office Story | 252 |
| 6 | pool-wall-vintage-summer-eyewear | Summer Wall | 253 |

## Shared Settings (all 24 scenes)
- `category_collection`: `eyewear`
- `scene_type`: `editorial`
- `is_active`: true
- `requires_extra_reference`: false
- `use_scene_reference`: false

## Per-Scene Details
- **trigger_blocks**: as specified per scene in the file (scenes with models include `personDetails`; still-life scenes use `layout` instead)
- **outfit_hint**: populated for scenes with models, null for still-life scenes (Car Still, Minimal Still)
- **suggested_colors**: only for "Aesthetic Color Editorial" sub-category; null for the other 3 sub-categories
- **prompt_template**: full prompt text from the file
- **description**: from the file

## How
Use the database insert tool to run 24 `INSERT INTO product_image_scenes (...)` statements across the 4 sub-categories.

