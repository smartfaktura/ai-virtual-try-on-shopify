

# Upload 24 Watches Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `watches` category collection (currently has 16 scenes with `category_sort_order: 17`). Organized into 4 sub-categories (6 scenes each). Update `category_sort_order` from 17 to 24 per RTF spec.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (6 each) |
|---|---|---|
| Editorial Product Studio (01-06) | 1 | watch-motion-blur-studio-hero, watch-blackwhite-hand-study, watch-hardware-dial-closeup, watch-sky-hero-still, watch-jewelry-creature-statement, watch-dark-shadow-product |
| On-Wrist Editorial Portraits (07-12) | 2 | watch-wrist-beauty-portrait, watch-hand-face-editorial, watch-low-angle-fashion-editorial, watch-silhouette-wrist-shadow, watch-tailored-wrist-closeup, watch-sensual-evening-portrait |
| Tailored & Everyday Watch Moments (13-18) | 3 | watch-business-seated-lifestyle, watch-shirt-cuff-daily-luxury, watch-cafe-table-lifestyle, watch-driving-wheel-moment, watch-evening-bar-lifestyle, watch-relaxed-weekend-luxury |
| Campaign Watch Statements (19-24) | 4 | watch-super-editorial-campaign, watch-vintage-cinematic-campaign, watch-dark-power-campaign, watch-tailored-authority-campaign, watch-monument-product-campaign, watch-wildcard-concept-campaign |

## Technical Details
- **sort_order**: RTF specifies 2401-2424; will use those values (no conflict with current max 2956)
- **category_collection**: `watches`
- **category_sort_order**: update existing 16 from `17` to `24` per RTF
- **Scenes 1, 3-6**: editorial product-only; `sceneEnvironment` + `visualDirection` + `layout` + `detailFocus`; no `personDetails`, no `outfit_hint`
- **Scene 2**: editorial + `personDetails`; outfit_hint: minimal monochrome styling; trigger: `personDetails, visualDirection, layout, detailFocus`
- **Scenes 7-8, 10-11**: editorial + `personDetails` + `stylingDetails`; outfit_hint: minimal luxury wrist-visible styling; `detailFocus`
- **Scene 9**: editorial + `personDetails` + `sceneEnvironment` + `stylingDetails`; outfit_hint; no `detailFocus`
- **Scene 12**: editorial + `personDetails` + `stylingDetails`; outfit_hint; no `detailFocus`
- **Scenes 13, 15-16**: lifestyle + `personDetails` + `sceneEnvironment` + `stylingDetails`; outfit_hint: polished daily styling
- **Scene 14**: lifestyle + `personDetails` + `stylingDetails` + `detailFocus`; outfit_hint
- **Scene 17**: lifestyle + `personDetails` + `sceneEnvironment` + `stylingDetails`; outfit_hint
- **Scene 18**: lifestyle + `personDetails` + `stylingDetails`; outfit_hint; no `sceneEnvironment`
- **Scene 19**: campaign + `personDetails` + `sceneEnvironment` + `stylingDetails` + `detailFocus`; outfit_hint: strong editorial styling
- **Scene 20**: campaign + `personDetails` + `sceneEnvironment` + `stylingDetails`; outfit_hint
- **Scene 21**: campaign + `personDetails` + `detailFocus`; outfit_hint; no `sceneEnvironment`
- **Scene 22**: campaign + `personDetails` + `stylingDetails` + `sceneEnvironment`; outfit_hint
- **Scene 23**: campaign product-only; `sceneEnvironment` + `visualDirection` + `layout` + `detailFocus`; no `personDetails`, no `outfit_hint`
- **Scene 24**: campaign + `personDetails` + `sceneEnvironment` + `detailFocus`; outfit_hint
- Scene types: editorial (1-12), lifestyle (13-18), campaign (19-24)
- No `suggested_colors` / `aestheticColor` for any scene
- Full prompt templates extracted from RTF

## Execution
1. UPDATE existing 16 watches scenes: set `category_sort_order = 24`
2. Single batch INSERT of 24 new rows with full prompt templates, trigger blocks, and outfit hints

