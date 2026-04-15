

# Upload 24 Beverages Editorial Scenes

## What's happening
The RTF file defines 24 new editorial scenes for the Beverages category, organized into 4 sub-categories. The `beverages` collection already has 19 "Essential Shots" (sub_category_sort_order: 0). These 24 scenes will be added as new sub-categories starting at sort_order 1.

## Scene Mapping (from RTF)

| Sub-Category | Sort Order | Scenes |
|---|---|---|
| Editorial Drink Studio (6 scenes) | sub_cat: 1 | beverage-editorial-front-hero, beverage-editorial-close-condensation, beverage-editorial-pour-action, beverage-editorial-floating-hand-crop, beverage-editorial-glass-serve-hero, beverage-editorial-flavor-world-hero |
| Social Lifestyle / Sport / Party UGC (6 scenes) | sub_cat: 2 | beverage-ugc-tennis-court, beverage-ugc-pool-cheers, beverage-ugc-car-window-style, beverage-ugc-close-face-hold, beverage-ugc-shopping-basket, beverage-ugc-friends-social-cheers |
| Fruit / Pour / Surface Still Life (6 scenes) | sub_cat: 3 | beverage-still-fruit-bed, beverage-still-citrus-slice-surface, beverage-still-open-tab-detail, beverage-still-pour-into-glass, beverage-still-seat-row-product, beverage-still-reflective-surface-hero |
| Aesthetic Color Beverage Stories (6 scenes) | sub_cat: 4 | beverage-color-wall-hero, beverage-color-handheld-story, beverage-color-sport-story, beverage-color-surface-still, beverage-color-night-mood, beverage-color-hero-campaign |

## Technical Details

- **Table**: `product_image_scenes`
- **category_collection**: `beverages`
- **category_sort_order**: `20` (as specified in RTF, replacing current `11`)
- **sort_order**: Starting at `2525` (current max is `2524`)
- **Aesthetic color scenes** (19-24): Will include `suggested_colors` with `[{"name":"Solar Tangerine","hex":"#F36C21"}]`
- **Outfit hint scenes** (04, 07-10, 12, 20-21): Will include `outfit_hint` from RTF
- **trigger_blocks**: Mapped per scene from RTF
- **prompt_template**: Full prompt text extracted from RTF
- **No schema changes needed** — all columns already exist

## Execution
- Single batch INSERT of 24 rows using the database insert tool
- Update existing 19 beverages scenes' `category_sort_order` from `11` to `20` to match RTF spec

