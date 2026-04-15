

# Upload 24 Rings Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `jewellery-rings` category collection (currently has 21 scenes with `category_sort_order: 34`). Organized into 6 sub-categories (4 scenes each). Update `category_sort_order` from 34 to 19 per RTF spec.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (4 each) |
|---|---|---|
| Editorial Product Studio (01-04) | 1 | rings-floating-editorial-studio, rings-shadow-pedestal-studio, rings-soft-reflection-studio, rings-clean-hero-closeup |
| On-Hand Editorial (05-08) | 2 | rings-hand-on-shoulder-editorial, rings-face-touch-editorial, rings-stacked-finger-editorial, rings-clean-beauty-crop |
| Lifestyle Hand UGC (09-12) | 3 | rings-coffee-hand-lifestyle, rings-windowlight-ugc-hand, rings-book-page-lifestyle, rings-relaxed-home-hand |
| Jewelry Still Life (13-16) | 4 | rings-stone-slab-stilllife, rings-linen-silk-stilllife, rings-window-shadow-stilllife, rings-water-glass-stilllife |
| Color Ring Stories (17-20) | 5 | rings-aesthetic-stone-color, rings-aesthetic-floating-story, rings-aesthetic-hand-story, rings-aesthetic-mineral-luxury |
| Campaign Macro Statements (21-24) | 6 | rings-extreme-macro-beauty, rings-crystal-flare-macro, rings-water-macro-campaign, rings-iconic-macro-finisher |

## Technical Details
- **sort_order**: starts at 2789 (current global max is 2788)
- **category_collection**: `jewellery-rings`
- **category_sort_order**: update all jewellery-rings scenes from `34` to `19` per RTF
- **Scenes 1-4**: still life / product-only; `sceneEnvironment, visualDirection, layout, detailFocus`; no `personDetails`, no `outfit_hint`
- **Scenes 5-8**: on-hand with `personDetails, visualDirection, layout, detailFocus`; no `outfit_hint` (jewelry category)
- **Scenes 9-12**: lifestyle with `personDetails, sceneEnvironment, visualDirection, layout`; no `detailFocus`, no `outfit_hint`
- **Scenes 13-16**: still life, no `personDetails`; `sceneEnvironment, visualDirection, layout, detailFocus`
- **Scenes 17-18, 20**: `aestheticColor` + still life (no `personDetails`); `suggested_colors` = `[{"name":"Mineral Sage","hex":"#A9B2A2"}]`
- **Scene 19**: `aestheticColor` + `personDetails`; `suggested_colors` = `[{"name":"Mineral Sage","hex":"#A9B2A2"}]`
- **Scene 21**: campaign with `personDetails, visualDirection, layout, detailFocus`
- **Scenes 22-24**: campaign still life / product-only; `sceneEnvironment, visualDirection, layout, detailFocus`; no `personDetails`
- No `outfit_hint` for any scene (jewelry category)
- All scenes `scene_type: editorial`
- Full prompt templates extracted from RTF

## Execution
1. UPDATE existing 21 jewellery-rings scenes: set `category_sort_order = 19`
2. Single batch INSERT of 24 new rows with full prompt templates, trigger blocks, and suggested colors

