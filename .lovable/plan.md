

# Import 24 Bag Scenes into product_image_scenes

## What This Does
Insert 24 new bag scenes from the RTF into `product_image_scenes`, mapped to `category_collection = 'bags-accessories'` (the existing bags category with 21 scenes already). All new `bag-*` scene IDs are unique and don't conflict with existing `*-bags` IDs.

## Scene Summary (24 scenes)

### Sub-Cat 1: Editorial Product Studio (sub_category_sort_order = 0)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 1 | bag-sculptural-studio-hero | Sculptural Bag Studio Hero | editorial | 2301 |
| 2 | bag-hardware-closeup-studio | Hardware & Craft Closeup | editorial | 2302 |
| 3 | bag-couch-luxury-still | Luxury Couch Bag Still | editorial | 2303 |
| 4 | bag-car-interior-still | Vintage Car Bag Still | editorial | 2304 |
| 5 | bag-monochrome-colorbox-studio | Monochrome Colorbox Bag | editorial | 2305 |
| 6 | bag-display-dome-editorial | Display Dome Bag Statement | editorial | 2306 |

### Sub-Cat 2: On-Body Editorial & Location (sub_category_sort_order = 1)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 7 | bag-onbody-architectural-editorial | Architectural On-Body Editorial | editorial | 2307 |
| 8 | bag-closebody-portrait-editorial | Close Body Bag Portrait | editorial | 2308 |
| 9 | bag-car-window-editorial | Car Window Bag Editorial | editorial | 2309 |
| 10 | bag-back-shoulder-editorial | Back Shoulder Bag View | editorial | 2310 |
| 11 | bag-sunshadow-outdoor-editorial | Sun & Shadow Bag Portrait | editorial | 2311 |
| 12 | bag-nature-minimal-editorial | Nature Minimal Bag Editorial | editorial | 2312 |

### Sub-Cat 3: Everyday UGC Bag Looks (sub_category_sort_order = 2)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 13 | bag-mirror-selfie-luxury | Luxury Bag Mirror Selfie | lifestyle | 2313 |
| 14 | bag-cafe-errand-ugc | Cafe Errand Bag Look | lifestyle | 2314 |
| 15 | bag-street-carry-casual | Street Carry Casual | lifestyle | 2315 |
| 16 | bag-travel-lobby-ugc | Travel Lobby Bag Moment | lifestyle | 2316 |
| 17 | bag-weekend-outing-ugc | Weekend Outing Bag Look | lifestyle | 2317 |
| 18 | bag-soft-home-carry-ugc | Soft Home Carry Story | lifestyle | 2318 |

### Sub-Cat 4: Campaign Bag Statements (sub_category_sort_order = 3)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 19 | bag-super-editorial-campaign | Super Editorial Bag Campaign | campaign | 2319 |
| 20 | bag-vintage-cinematic-campaign | Vintage Cinematic Bag Campaign | campaign | 2320 |
| 21 | bag-nature-epic-campaign | Nature Epic Bag Campaign | campaign | 2321 |
| 22 | bag-stilllife-stack-campaign | Stacked Bag Campaign Still | campaign | 2322 |
| 23 | bag-logo-detail-campaign | Logo Detail Campaign | campaign | 2323 |
| 24 | bag-wildcard-concept-campaign | Concept Wildcard Bag Campaign | campaign | 2324 |

## Aesthetic Color Handling
Scene 5 (bag-monochrome-colorbox-studio) includes `aestheticColor` in its trigger blocks and already uses the `{{aestheticColor}}` token in its prompt template. No hardcoded color to replace -- it's already dynamic.

## Outfit Hints
- On-Body Editorial scenes (7-12): "Minimal luxury styling with clean tailoring or soft separates, quiet jewelry, elongated line, and nothing that competes with the bag."
- Everyday UGC scenes (13-18): "Relaxed premium off-duty styling with simple layers, clean accessories, natural carry behavior, and nothing that distracts from the bag."
- Campaign scenes with models (19-21, 24): "Sharp editorial styling with controlled silhouettes, quiet luxury accessories, strong carry framing, and nothing that overpowers the bag."
- Still-life campaign scenes (22, 23): No outfit hint (NULL).
- Editorial Product Studio scenes (1-6): No outfit hint (NULL).

## Key Fields (all 24 rows)
- `category_collection = 'bags-accessories'`, `category_sort_order = 23`
- Full `prompt_template`, `trigger_blocks`, `outfit_hint` from RTF
- `is_active = true`, `requires_extra_reference = false`, `use_scene_reference = false`

## Implementation
Single batch INSERT via the database insert tool with all 24 rows. No code changes needed.

