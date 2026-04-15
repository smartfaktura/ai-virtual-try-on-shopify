

# Upload 24 Snacks/Food Editorial Scenes

## Summary
Insert 24 new editorial scenes for a new `snacks-food` category collection (no existing scenes). Organized into 4 sub-categories (6 scenes each). Set `category_sort_order = 23` per RTF spec.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (6 each) |
|---|---|---|
| Editorial Snack Product Studio (01-06) | 1 | snack-editorial-front-hero, snack-editorial-open-pack-detail, snack-editorial-snack-closeup, snack-editorial-ingredient-world, snack-editorial-floating-piece-story, snack-editorial-grouping-hero |
| Handheld / Eating Editorial (07-12) | 2 | snack-handheld-product-hero, snack-eating-bite-moment, snack-inhand-and-bowl, snack-face-adjacent-crop, snack-sharing-hands-story, snack-pickup-gesture-detail |
| Tabletop / Pantry / Daily UGC (13-18) | 3 | snack-tabletop-daily-use, snack-pantry-shelf-routine, snack-lunchbox-or-bag-story, snack-cafe-desk-break, snack-bowl-pour-lifestyle, snack-evening-movie-night |
| Aesthetic Color Snack Stories (19-24) | 4 | snack-color-surface-still, snack-color-handheld-story, snack-color-tabletop-story, snack-color-sculptural-set, snack-color-sharing-story, snack-color-hero-campaign |

## Technical Details
- **sort_order**: starts at 2861 (current global max is 2860)
- **category_collection**: `snacks-food`
- **category_sort_order**: 23
- **Scenes 1-6**: product-only stills; `productDetails` + various combos of `sceneEnvironment`, `visualDirection`, `layout`, `detailFocus`; no `personDetails`, no `outfit_hint`
- **Scenes 7-12**: handheld/eating with `personDetails` + `productDetails`; scenes 9 adds `sceneEnvironment`; scenes 8, 12 include `detailFocus`; no `outfit_hint`
- **Scenes 13-18**: lifestyle; `productDetails` + `sceneEnvironment` + `visualDirection` + `layout`; scene 15 adds `stylingDetails`; scene 17 adds `detailFocus`; no `personDetails` (product-only), no `outfit_hint`
- **Scenes 19, 22**: `aestheticColor` + still life (no `personDetails`); `suggested_colors` = `[{"name":"Toasted Apricot Clay","hex":"#D98A5E"}]`
- **Scenes 20, 23**: `aestheticColor` + `personDetails`; `suggested_colors` = `[{"name":"Toasted Apricot Clay","hex":"#D98A5E"}]`
- **Scene 21**: `aestheticColor` lifestyle (no `personDetails`); `suggested_colors`
- **Scene 24**: `aestheticColor` campaign (no `personDetails`); `suggested_colors`; `scene_type: campaign`
- Scene types: editorial (1-12, 19-20, 22), lifestyle (13-18, 21, 23), campaign (24)
- Note: uses `productDetails` trigger instead of typical fashion triggers; no `outfit_hint` for any scene (food category)
- Full prompt templates extracted from RTF

## Execution
1. Single batch INSERT of 24 new rows with full prompt templates, trigger blocks, and suggested colors (no existing rows to update)

