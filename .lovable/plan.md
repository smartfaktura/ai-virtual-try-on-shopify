

# Import 24 Belt Scenes into product_image_scenes

## What This Does
Insert 24 new belt scenes into `product_image_scenes`, mapped to `category_collection = 'belts'` (already has existing scenes with `category_sort_order = 15`). New scenes use `category_sort_order = 21` as specified in the RTF. The TITLE_MAP already has a `belts` entry mapped to "Belts".

For the 6 Aesthetic Color scenes (17-22), hardcoded "Oxblood Clay (#8B5A4A)" references will be replaced with `{{aestheticColor}}` token, and `suggested_colors` set to `[{"hex":"#8B5A4A","label":"Oxblood Clay"}]`.

## Scene Summary (24 scenes)

### Sub-Cat 1: Editorial Product Studio (sub_category_sort_order = 0)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 1 | belt-sculptural-rod-studio | Sculptural Rod Belt Studio | editorial | 2101 |
| 2 | belt-buckle-closeup-editorial | Buckle Hero Closeup | editorial | 2102 |
| 3 | belt-multiple-belts-editorial-lineup | Editorial Belt Lineup | editorial | 2103 |
| 4 | belt-plaster-block-studio | Plaster Block Belt Still | editorial | 2104 |

### Sub-Cat 2: On-Body Waist Editorial (sub_category_sort_order = 1)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 5 | belt-tailored-fullbody-editorial | Tailored Full-Body Belt Editorial | editorial | 2105 |
| 6 | belt-waist-crop-luxury | Luxury Waist Crop | editorial | 2106 |
| 7 | belt-relaxed-shirt-waist | Relaxed Shirt & Belt Editorial | editorial | 2107 |
| 8 | belt-seated-chair-editorial | Seated Chair Belt Editorial | editorial | 2108 |

### Sub-Cat 3: Everyday Outfit UGC (sub_category_sort_order = 2)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 9 | belt-everyday-mirror-style | Everyday Mirror Belt Look | lifestyle | 2109 |
| 10 | belt-bag-outfit-lifestyle | Bag & Belt Outfit Moment | lifestyle | 2110 |
| 11 | belt-outdoor-resort-look | Outdoor Resort Belt Look | lifestyle | 2111 |
| 12 | belt-walking-candid-waist | Walking Candid Belt Crop | lifestyle | 2112 |

### Sub-Cat 4: Styled Flat Lay / Folded Still (sub_category_sort_order = 3)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 13 | belt-looped-flatlay-graphic | Looped Graphic Belt Flat Lay | stilllife | 2113 |
| 14 | belt-linen-shadow-still | Linen Shadow Belt Still | stilllife | 2114 |
| 15 | belt-folded-buckle-still | Folded Buckle Still Life | stilllife | 2115 |
| 16 | belt-drawer-accessory-story | Accessory Drawer Belt Story | stilllife | 2116 |

### Sub-Cat 5: Aesthetic Color Belt Stories (sub_category_sort_order = 4)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 17 | belt-aesthetic-color-studio | Color Belt Studio Story | editorial | 2117 |
| 18 | belt-aesthetic-waist-portrait | Color Waist Belt Portrait | editorial | 2118 |
| 19 | belt-aesthetic-flatlay-story | Color Flat Lay Belt Story | stilllife | 2119 |
| 20 | belt-aesthetic-hardware-closeup | Color Hardware Belt Closeup | editorial | 2120 |

### Sub-Cat 6: Campaign Accessory Statements (sub_category_sort_order = 5)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 21 | belt-dark-luxury-campaign | Dark Luxury Belt Campaign | campaign | 2121 |
| 22 | belt-sunlit-waist-campaign | Sunlit Waist Belt Campaign | campaign | 2122 |
| 23 | belt-hardware-monument-campaign | Monument Hardware Belt Campaign | campaign | 2123 |
| 24 | belt-iconic-hero-finale | Iconic Belt Hero | campaign | 2124 |

## Aesthetic Color Handling (Scenes 17-20)
- Prompt templates already use `{{aestheticColor}}` token (no hardcoded color to replace)
- `suggested_colors` set to `[{"hex":"#8B5A4A","label":"Oxblood Clay"}]`

## Outfit Hints
- On-Body Waist Editorial (5-8): "Clean tailored styling with a defined waist, minimal shirting or knit layers, elongated line, premium fabric, and nothing that hides the belt."
- Everyday Outfit UGC (9-12): "Relaxed premium off-duty styling with clean denim, trousers, shorts, or shirting, natural confidence, and nothing that obscures the belt line."
- Aesthetic Color waist portrait (18): "Minimal tailored styling with trousers, shorts, knit layers, or socks in {{aestheticColor}}, clear waist definition, modern restraint, and nothing that hides the belt."
- Campaign on-body scenes (22, 24): "Sharp editorial styling with clean tailoring or fluid separates, strong waist visibility, controlled silhouette, and nothing that distracts from the belt."
- Product-only scenes (1-4, 13-16, 17, 19-20, 21, 23): No outfit hint (NULL)

## Key Fields (all 24 rows)
- `category_collection = 'belts'`, `category_sort_order = 21`
- Full `prompt_template`, `trigger_blocks` from RTF
- `is_active = true`, `requires_extra_reference = false`, `use_scene_reference = false`

## Implementation
Single batch INSERT via the database insert tool with all 24 rows. No code changes needed.

