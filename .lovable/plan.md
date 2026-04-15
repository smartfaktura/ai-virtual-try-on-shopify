

# Upload 24 Supplements & Wellness Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `supplements-wellness` category collection (currently has 16 scenes with `category_sort_order: 11`). Organized into 4 sub-categories (6 scenes each). Update `category_sort_order` from 11 to 22 per RTF spec.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (6 each) |
|---|---|---|
| Editorial Wellness Routine (01-06) | 1 | wellness-editorial-morning-counter, wellness-editorial-hand-water-ritual, wellness-editorial-dose-prep, wellness-editorial-shelf-portrait, wellness-editorial-sinkside-composition, wellness-editorial-tray-ritual |
| Kitchen / Gym / Daily UGC (07-12) | 2 | wellness-ugc-kitchen-counter, wellness-ugc-post-workout, wellness-ugc-workday-break, wellness-ugc-mix-prep, wellness-ugc-travel-go, wellness-ugc-handheld-moment |
| Ingredient / Capsule Still Life (13-18) | 3 | wellness-still-capsule-spill, wellness-still-powder-scoop, wellness-still-ingredient-pairing, wellness-still-dish-tray-dose, wellness-still-water-glass, wellness-still-macro-detail |
| Aesthetic Color Wellness Stories (19-24) | 4 | wellness-color-counter-ritual, wellness-color-kitchen-story, wellness-color-surface-still, wellness-color-reflection-mood, wellness-color-tray-hero, wellness-color-hero-campaign |

## Technical Details
- **sort_order**: uses RTF-specified values 2201-2224 (within current global max 2908, but these are category-specific sort values consistent with pattern)
- **category_collection**: `supplements-wellness`
- **category_sort_order**: update all existing from `11` to `22` per RTF
- **Scenes 1, 4-6**: product-only editorial; `productDetails` + `sceneEnvironment` + `visualDirection` + `layout`; no `personDetails`, no `outfit_hint`
- **Scene 2**: editorial + `personDetails`; outfit_hint: minimal wellness styling in soft neutrals
- **Scene 3**: editorial + `personDetails` + `detailFocus`; outfit_hint: minimal wellness-clean styling
- **Scenes 7, 9, 11**: lifestyle product-only; `productDetails` + `sceneEnvironment` + `visualDirection` + `layout`; no `personDetails`
- **Scene 8**: lifestyle + `personDetails`; outfit_hint: clean active-lifestyle styling
- **Scene 10**: lifestyle + `personDetails`; outfit_hint: relaxed home-wellness styling
- **Scene 12**: lifestyle + `personDetails`; outfit_hint: understated daily styling
- **Scenes 13-14**: stilllife + `detailFocus`; no `personDetails`
- **Scenes 15-17**: stilllife; no `detailFocus` (except 18); no `personDetails`
- **Scene 18**: stilllife + `detailFocus`
- **Scenes 19-23**: `aestheticColor` + `productDetails` + `sceneEnvironment` + `visualDirection` + `layout`; no `personDetails`; `suggested_colors` = `[{"name":"Muted Sage Mineral","hex":"#A8B29F"}]`
- **Scene 24**: `aestheticColor` campaign + `detailFocus`; `suggested_colors`; `scene_type: campaign`
- No outfit_hint for any aesthetic color scene (product-only wellness)
- Full prompt templates extracted from RTF

## Execution
1. UPDATE existing 16 supplements-wellness scenes: set `category_sort_order = 22`
2. Single batch INSERT of 24 new rows with full prompt templates, trigger blocks, and suggested colors

