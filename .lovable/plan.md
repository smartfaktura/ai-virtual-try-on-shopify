

# Upload 24 Streetwear Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `streetwear` category collection (currently has 18 scenes with `category_sort_order: 24`). Organized into 4 sub-categories (6 scenes each). Update `category_sort_order` from 24 to 22 per RTF spec.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (6 each) |
|---|---|---|
| Editorial Street Portraits (01-06) | 1 | streetwear-editorial-front-portrait, streetwear-editorial-seated-chair, streetwear-editorial-side-profile, streetwear-editorial-detail-crop, streetwear-editorial-open-layer-look, streetwear-editorial-back-view |
| Off-Duty / City UGC (07-12) | 2 | streetwear-ugc-sidewalk-walk, streetwear-ugc-wall-lean, streetwear-ugc-coffee-run, streetwear-ugc-stairs-corridor, streetwear-ugc-travel-city, streetwear-ugc-hands-adjusting |
| Styled Rack / Floor / Interior Still (13-18) | 3 | streetwear-still-hanger-rail, streetwear-still-chair-drape, streetwear-still-folded-floor, streetwear-still-shelf-placement, streetwear-still-detail-closure-graphic, streetwear-still-one-object-style |
| Aesthetic Color Street Stories (19-24) | 4 | streetwear-color-wall-portrait, streetwear-color-lounge-chair-story, streetwear-color-surface-still, streetwear-color-entry-corridor, streetwear-color-reflection-mood, streetwear-color-hero-campaign |

## Technical Details
- **sort_order**: starts at 2885 (current global max is 2884)
- **category_collection**: `streetwear`
- **category_sort_order**: update all streetwear scenes from `24` to `22` per RTF
- **Scenes 1-3, 5-6**: editorial; `personDetails` + `sceneEnvironment`/`stylingDetails` + `visualDirection` + `layout`; outfit_hint for all
- **Scene 4**: editorial; `personDetails` + `visualDirection` + `layout` + `detailFocus`; outfit_hint
- **Scene 5**: editorial; `personDetails` + `stylingDetails` + `visualDirection` + `layout`; no `sceneEnvironment`; outfit_hint
- **Scenes 7-11**: lifestyle; all have `personDetails` + `sceneEnvironment` + `stylingDetails` + `visualDirection` + `layout`; outfit_hint for all
- **Scene 8**: lifestyle; same triggers as 7 (parsed from compact format); outfit_hint
- **Scene 12**: lifestyle; `personDetails` + `visualDirection` + `layout` + `detailFocus`; no `sceneEnvironment`; outfit_hint
- **Scenes 13-16**: still life; no `personDetails`, no `outfit_hint`; various combos of `sceneEnvironment`, `visualDirection`, `layout`, `detailFocus`
- **Scene 17**: still life; `productDetails` + `visualDirection` + `layout` + `detailFocus`; no `sceneEnvironment`
- **Scene 18**: still life; adds `stylingDetails` + `sceneEnvironment`
- **Scenes 19-20**: `aestheticColor` + `personDetails` + `sceneEnvironment` + `stylingDetails`; outfit_hint; `suggested_colors` = `[{"name":"Urban Moss Slate","hex":"#6F7568"}]`
- **Scene 21**: `aestheticColor` still life (no `personDetails`, no outfit_hint); `suggested_colors`
- **Scene 22**: `aestheticColor` lifestyle + `personDetails` + `stylingDetails`; outfit_hint; `suggested_colors`
- **Scene 23**: `aestheticColor` editorial + `personDetails`; no `stylingDetails`; outfit_hint; `suggested_colors`
- **Scene 24**: `aestheticColor` campaign + `personDetails` + `stylingDetails` + `detailFocus`; outfit_hint; `suggested_colors`
- Full prompt templates extracted from RTF

## Execution
1. UPDATE existing 18 streetwear scenes: set `category_sort_order = 22`
2. Single batch INSERT of 24 new rows with full prompt templates, trigger blocks, outfit hints, and suggested colors

