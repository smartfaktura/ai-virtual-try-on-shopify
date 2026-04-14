

# Import 24 Backpack Scenes into product_image_scenes

## What This Does
Insert 24 new backpack scenes into `product_image_scenes`, mapped to `category_collection = 'backpacks'` with `category_sort_order = 17`. The TITLE_MAP already has a `backpacks` entry mapped to "Backpacks".

For the 6 Aesthetic Color scenes (19-24), following the same pattern as activewear: replace hardcoded "Smoked Olive Stone (#8F9582)" references with `{{aestheticColor}}` token and set `suggested_colors` to `[{"hex":"#8F9582","label":"Smoked Olive Stone"}]`.

## Scene Summary (24 scenes)

### Sub-Cat 1: On-Body Editorial Carry (sub_category_sort_order = 0)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 1 | backpack-editorial-one-shoulder-carry | One Shoulder Carry | editorial | 1701 |
| 2 | backpack-editorial-back-view-hero | Back View Hero | editorial | 1702 |
| 3 | backpack-editorial-top-handle-carry | Hand Carry by Top Handle | editorial | 1703 |
| 4 | backpack-editorial-seated-beside-body | Seated With Backpack Beside Body | editorial | 1704 |
| 5 | backpack-editorial-side-walk | Walking Editorial Side Profile | editorial | 1705 |
| 6 | backpack-editorial-strap-detail-crop | Cropped Torso and Strap Detail | editorial | 1706 |

### Sub-Cat 2: Daily Use / Commute UGC (sub_category_sort_order = 1)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 7 | backpack-ugc-coffee-run | Coffee Run Backpack Moment | lifestyle | 1707 |
| 8 | backpack-ugc-office-entry | Desk Arrival / Office Entry | lifestyle | 1708 |
| 9 | backpack-ugc-hallway-mirror | Transit / Hallway Mirror Feel | lifestyle | 1709 |
| 10 | backpack-ugc-airport-routine | Airport / Travel Routine | lifestyle | 1710 |
| 11 | backpack-ugc-essentials-pullout | Daily Essentials Pull-Out | lifestyle | 1711 |
| 12 | backpack-ugc-stair-pause | Stair or Sidewalk Pause | lifestyle | 1712 |

### Sub-Cat 3: Styled Surface / Shelf Still Life (sub_category_sort_order = 2)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 13 | backpack-still-stone-surface | Stone Surface Hero | stilllife | 1713 |
| 14 | backpack-still-chair-lean | Chair Drape / Lean Still | stilllife | 1714 |
| 15 | backpack-still-open-surface | Open Backpack Surface Composition | stilllife | 1715 |
| 16 | backpack-still-shelf-placement | Shelf / Wardrobe Placement | stilllife | 1716 |
| 17 | backpack-still-travel-essentials | Travel Essentials Styled Still | stilllife | 1717 |
| 18 | backpack-still-reflection-surface | Reflection Surface Campaign Still | stilllife | 1718 |

### Sub-Cat 4: Aesthetic Color Backpack Stories (sub_category_sort_order = 3)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 19 | backpack-color-wall-carry | Color Wall Carry Story | editorial | 1719 |
| 20 | backpack-color-entry-story | Color Desk / Entry Story | lifestyle | 1720 |
| 21 | backpack-color-surface-still | Color Surface Still Life | editorial | 1721 |
| 22 | backpack-color-reflection-mood | Color Reflection Mood | editorial | 1722 |
| 23 | backpack-color-chair-upholstery | Color Chair / Upholstery Story | editorial | 1723 |
| 24 | backpack-color-hero-campaign | Color Hero Campaign Backpack | campaign | 1724 |

## Aesthetic Color Handling (Scenes 19-24)
- All hardcoded "Smoked Olive Stone (#8F9582)" and "Smoked Olive Stone" in prompt templates and descriptions replaced with `{{aestheticColor}}`
- `suggested_colors` set to `[{"hex":"#8F9582","label":"Smoked Olive Stone"}]`
- Scenes 19 and 24 have outfit_hint; others do not

## Key Fields (all 24 rows)
- `category_collection = 'backpacks'`, `category_sort_order = 17`
- Full `prompt_template`, `trigger_blocks`, `outfit_hint` from RTF
- `is_active = true`, `requires_extra_reference = false`, `use_scene_reference = false`

## Implementation
Single INSERT via the database insert tool with all 24 rows. No code changes needed.

