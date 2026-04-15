

# Upload 24 Necklaces Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `jewellery-necklaces` category collection (currently has 21 scenes with `category_sort_order: 31`). Organized into 6 sub-categories (4 scenes each). Update `category_sort_order` from 31 to 19 per RTF spec.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (4 each) |
|---|---|---|
| Editorial Neck Studio (01-04) | 1 | necklace-editorial-neck-portrait, necklace-seated-editorial-studio, necklace-shadow-face-editorial, necklace-layered-editorial-studio |
| Collarbone & Body Crops (05-08) | 2 | necklace-collarbone-closeup, necklace-open-shirt-crop, necklace-backline-drop, necklace-hand-neck-bodycrop |
| Lifestyle Jewelry Moments (09-12) | 3 | necklace-mirror-self-portrait, necklace-book-coffee-lifestyle, necklace-soft-window-lifestyle, necklace-candid-luxury-lifestyle |
| Styled Necklace Still Life (13-16) | 4 | necklace-ceramic-shadow-stilllife, necklace-paper-stone-stilllife, necklace-silk-fold-stilllife, necklace-book-object-stilllife |
| Aesthetic Color Necklace Stories (17-20) | 5 | necklace-aesthetic-color-portrait, necklace-aesthetic-stilllife-story, necklace-aesthetic-drape-story, necklace-aesthetic-sculptural-object |
| Campaign Necklace Statements (21-24) | 6 | necklace-dark-campaign-portrait, necklace-sunlit-campaign-glow, necklace-waterlight-campaign, necklace-iconic-hero-finisher |

## Technical Details
- **sort_order**: starts at 2765 (current global max is 2764)
- **category_collection**: `jewellery-necklaces`
- **category_sort_order**: update all jewellery-necklaces scenes from `31` to `19` per RTF
- **Scenes 1-4**: `personDetails` + `detailFocus` + `visualDirection` + `layout`; no outfit_hint (jewelry category)
- **Scenes 5-8**: `personDetails` + `detailFocus` + `visualDirection` + `layout`; scene 7 includes `backView`
- **Scenes 9-12**: `personDetails` + `sceneEnvironment` + `visualDirection` + `layout`; no `detailFocus`
- **Scenes 13-16**: still life, no `personDetails`; `sceneEnvironment` + `detailFocus` + `visualDirection` + `layout`
- **Scenes 17-20**: `aestheticColor` trigger; scenes 17, 19 include `personDetails`; scenes 18, 20 are still life; `suggested_colors` = `[{"name":"Soft Camel Blush","hex":"#C8A693"}]`
- **Scenes 21-22**: `personDetails` + `detailFocus` + `visualDirection` + `layout` (campaign portraits)
- **Scene 23**: still life campaign (no `personDetails`); `sceneEnvironment` + `detailFocus`
- **Scene 24**: `personDetails` + `sceneEnvironment` + `detailFocus` + `visualDirection` + `layout` (hero finisher)
- No `outfit_hint` for any scene (jewelry category — no garment styling)
- Full prompt templates extracted from RTF

## Execution
1. UPDATE existing 21 jewellery-necklaces scenes: set `category_sort_order = 19`
2. Single batch INSERT of 24 new rows with full prompt templates, trigger blocks, and suggested colors

