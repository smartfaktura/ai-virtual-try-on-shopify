

# Upload 24 Skirts Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `skirts` category collection (currently has 12 scenes with `category_sort_order: 34`). Organized into 4 sub-categories (6 each). Update `category_sort_order` from 34 to 24 per RTF spec.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes |
|---|---|---|
| Editorial Skirt Portraits (01-06) | 1 | skirt-editorial-front-portrait, skirt-editorial-seated-legline, skirt-editorial-side-profile, skirt-editorial-waist-detail-crop, skirt-editorial-standing-slit-accent, skirt-editorial-back-view |
| Street / Social Skirt Moments (07-12) | 2 | skirt-lifestyle-sidewalk-walk, skirt-lifestyle-wall-lean, skirt-lifestyle-cafe-terrace, skirt-lifestyle-stair-corridor, skirt-lifestyle-resort-outdoor, skirt-lifestyle-hands-adjusting |
| Styled Skirt Still Life (13-18) | 3 | skirt-still-hanger-rail, skirt-still-chair-drape, skirt-still-folded-surface, skirt-still-wardrobe-placement, skirt-still-detail-waist-hem, skirt-still-one-object-style |
| Aesthetic Color Skirt Stories (19-24) | 4 | skirt-color-wall-portrait, skirt-color-lounge-chair-story, skirt-color-surface-still, skirt-color-entry-corridor, skirt-color-reflection-mood, skirt-color-hero-campaign |

## Technical Details
- **sort_order**: starts at 2837 (current global max is 2836)
- **category_collection**: `skirts`
- **category_sort_order**: update all skirts scenes from `34` to `24` per RTF
- **Scenes 1-6**: editorial; `personDetails` + `stylingDetails/sceneEnvironment` + `visualDirection` + `layout`; scene 4 includes `detailFocus`; outfit_hint for all 6
- **Scenes 7-12**: lifestyle; all have `personDetails` + `sceneEnvironment` + `stylingDetails` + `visualDirection` + `layout`; scene 12 swaps `sceneEnvironment`+`stylingDetails` for `detailFocus`; outfit_hint for all 6
- **Scenes 13-18**: still life, no `personDetails`, no `outfit_hint`; various combos of `sceneEnvironment`, `visualDirection`, `layout`, `detailFocus`, `stylingDetails`
- **Scenes 19-20, 22-23**: `aestheticColor` + `personDetails` + outfit_hint; `suggested_colors` = `[{"name":"Dusty Fig Stone","hex":"#9C7A74"}]`
- **Scene 21**: `aestheticColor` still life (no `personDetails`, no outfit_hint)
- **Scene 24**: `aestheticColor` campaign with `personDetails` + `detailFocus` + outfit_hint; scene_type = `campaign`
- Full prompt templates extracted from RTF

## Execution
1. UPDATE existing 12 skirts scenes: set `category_sort_order = 24`
2. Single batch INSERT of 24 new rows with full prompt templates, trigger blocks, outfit hints, and suggested colors

