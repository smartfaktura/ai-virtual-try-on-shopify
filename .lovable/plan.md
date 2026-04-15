

# Upload 24 Swimwear Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `swimwear` category collection (currently has 18 scenes with `category_sort_order: 28`). Organized into 4 sub-categories (6 scenes each). Keep `category_sort_order` at 28 (no change specified in RTF).

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (6 each) |
|---|---|---|
| Editorial Resort Poses (01-06) | 1 | swimwear-editorial-lounger-resort, swimwear-editorial-poolside-standing, swimwear-editorial-balcony-seated, swimwear-editorial-cabana-curtain, swimwear-editorial-yacht-deck, swimwear-editorial-resort-stairs |
| Pool / Beach Lifestyle UGC (07-12) | 2 | swimwear-ugc-towel-after-swim, swimwear-ugc-pool-edge-walk, swimwear-ugc-beach-towel-sit, swimwear-ugc-bag-essentials, swimwear-ugc-candid-friend-shot, swimwear-ugc-shoreline-pause |
| Folded / Wet Surface Still (13-18) | 3 | swimwear-still-folded-towel, swimwear-still-wet-tile, swimwear-still-chair-ladder-drape, swimwear-still-sandy-surface, swimwear-still-water-reflection, swimwear-still-resort-essentials |
| Aesthetic Color Swim Stories (19-24) | 4 | swimwear-color-resort-wall, swimwear-color-poolside-story, swimwear-color-towel-fabric, swimwear-color-sunset-mood, swimwear-color-water-reflection, swimwear-color-editorial-hero |

## Technical Details
- **sort_order**: starts at 2909 (current global max is 2908)
- **category_collection**: `swimwear`
- **category_sort_order**: 28 (unchanged — no new value specified in RTF)
- **Scenes 1-6**: editorial; `personDetails` + `productDetails` + `sceneEnvironment` + `visualDirection` + `layout`; outfit_hint for all (swimwear resort styling)
- **Scenes 7-12**: lifestyle; `personDetails` + `productDetails` + `sceneEnvironment` + `stylingDetails` + `visualDirection` + `layout`; outfit_hint for all
- **Scenes 13-18**: stilllife; `productDetails` + `sceneEnvironment` + `visualDirection` + `layout`; no `personDetails`, no `outfit_hint`
- **Scenes 19-20**: `aestheticColor` + `personDetails`; `suggested_colors` includes all 5 colors: Lagoon Soft Blue #9FCFD4, Seafoam Mist #BFD8D2, Apricot Sand #E9B89A, Aqua Glass #9FD6D2, Shell Beige #DCCBB8; outfit_hint
- **Scene 21**: `aestheticColor` still life (no `personDetails`, no outfit_hint); same `suggested_colors`
- **Scene 22**: `aestheticColor` + `personDetails`; outfit_hint; same `suggested_colors`
- **Scene 23**: `aestheticColor` product-only (no `personDetails`, no outfit_hint); same `suggested_colors`
- **Scene 24**: `aestheticColor` + `personDetails`; outfit_hint; same `suggested_colors`; `scene_type: campaign`
- Scene types: editorial (1-6, 19), lifestyle (7-12, 20, 22), stilllife (13-18, 21, 23), campaign (24)
- Full prompt templates extracted from RTF

## Execution
1. Single batch INSERT of 24 new rows with full prompt templates, trigger blocks, outfit hints, and suggested colors (no category_sort_order update needed)

