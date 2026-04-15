

# Upload 24 Lingerie Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `lingerie` category collection (currently has 18 scenes with `category_sort_order: 29`). Organized into 6 sub-categories (4 scenes each). Keep `category_sort_order` at 29 (no change specified in RTF).

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (4 each) |
|---|---|---|
| Clean Intimate Studio (01-04) | 1 | lingerie-clean-soft-standing, lingerie-clean-seated-contour, lingerie-clean-side-profile, lingerie-clean-floor-folded |
| Editorial Boudoir Minimal (05-08) | 2 | lingerie-boudoir-bed-edge-shadow, lingerie-boudoir-sheet-wrap, lingerie-boudoir-curtain-corner, lingerie-boudoir-vanity-mirror |
| Soft Lifestyle / Bedroom UGC (09-12) | 3 | lingerie-ugc-morning-mirror, lingerie-ugc-coffee-bed, lingerie-ugc-robe-layer, lingerie-ugc-reading-soft |
| Fabric / Detail / Flat Lay Still (13-16) | 4 | lingerie-still-folded-linen, lingerie-still-drawer-hanger, lingerie-still-macro-detail, lingerie-still-gift-tissue |
| Aesthetic Color Intimate Stories (17-20) | 5 | lingerie-color-dusty-rose, lingerie-color-sage-calm, lingerie-color-cocoa-story, lingerie-color-icy-satin |
| Campaign Sensual Statements (21-24) | 6 | lingerie-campaign-sunlit-hero, lingerie-campaign-deep-shadow, lingerie-campaign-silk-motion, lingerie-campaign-iconic-portrait |

## Technical Details
- **sort_order**: starts at 2717 (current global max is 2716)
- **category_collection**: `lingerie`
- **category_sort_order**: remains `29` (no change needed)
- **Scenes 1-12**: `trigger_blocks` include `personDetails`, have `outfit_hint` (minimal styling directions for lingerie-appropriate layering)
- **Scenes 13-16**: still life, no `personDetails`, no `outfit_hint`; scene 15 includes `detailFocus`
- **Scenes 17-20**: `aestheticColor` + `personDetails` + outfit hint; `suggested_colors` = `[{"name":"Dusty Rose Blush","hex":"#C9A0A0"}]`
- **Scenes 21-24**: campaign with `personDetails` + outfit hint
- Full prompt templates extracted from RTF

## Execution
1. Single batch INSERT of 24 new rows (no UPDATE needed since `category_sort_order` is already 29)

