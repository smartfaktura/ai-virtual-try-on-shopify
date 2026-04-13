

# Insert 18 Shoes "Fashion Editorial" Scenes (3 Batches)

## Summary
Insert 18 new scenes into `product_image_scenes` under the `shoes` category, all in the `Fashion Editorial` sub-category, across three batches from the uploaded files.

## Batch 1: Fashion Editorial (category_sort_order: 20, sub_category_sort_order: 20)

| # | scene_id | title | sort_order | has model? |
|---|----------|-------|------------|------------|
| 1 | tulle-legs-heels | Tulle Legs | 210 | Yes |
| 2 | lace-pull-chair-shoes | Lace Pull | 211 | Yes |
| 3 | sun-arch-floor-shoes | Sun Arch | 212 | Yes |
| 4 | folded-body-shoes | Folded Body | 213 | Yes |
| 5 | bridge-balance-shoes | Bridge Balance | 214 | Yes |
| 6 | city-lace-down-shoes | City Lace | 215 | Yes |

## Batch 2: Fashion Editorial (category_sort_order: 21, sub_category_sort_order: 21)

| # | scene_id | title | sort_order | has model? |
|---|----------|-------|------------|------------|
| 1 | hand-carry-heels | Carry Heels | 216 | Yes |
| 2 | extended-boot-pose | Boot Extension | 217 | Yes |
| 3 | folded-boot-editorial | Folded Boot | 218 | Yes |
| 4 | giant-foreground-boot | Foreground Boot | 219 | Yes |
| 5 | sunlit-pedestal-pump | Pedestal Pump | 220 | No |
| 6 | diagonal-slope-sneaker | Slope Sneaker | 221 | No |

## Batch 3: Fashion Editorial (category_sort_order: 22, sub_category_sort_order: 22)

| # | scene_id | title | sort_order | has model? |
|---|----------|-------|------------|------------|
| 1 | poolside-point-heels | Poolside Point | 222 | Yes |
| 2 | chalk-frame-sneakers | Chalk Frame | 223 | No |
| 3 | pleated-snake-step | Snake Step | 224 | Yes |
| 4 | panel-floor-slingback | Panel Slingback | 225 | Yes |
| 5 | wire-chair-boot | Chair Boot | 226 | Yes |
| 6 | window-shadow-pump | Window Pump | 227 | No |

## Shared Settings (all 18)
- `category_collection`: `shoes`
- `sub_category`: `Fashion Editorial`
- `scene_type`: `editorial`
- `is_active`: true
- `suggested_colors`: null
- `requires_extra_reference`: false
- `use_scene_reference`: false

## Per-Scene Details
- Scenes with models: `trigger_blocks` include `personDetails`, `outfit_hint` populated from files
- Still-life scenes (Pedestal Pump, Slope Sneaker, Chalk Frame, Window Pump): no `personDetails`, no `outfit_hint`
- Full prompt templates and descriptions from the uploaded files
- Each batch uses its own `category_sort_order` (20, 21, 22) and `sub_category_sort_order` (20, 21, 22) as specified in the files

## How
Use the database insert tool to run 18 `INSERT INTO product_image_scenes (...)` statements across 3 batches.

