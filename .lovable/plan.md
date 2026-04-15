

# Upload 24 Makeup & Lipsticks Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `makeup-lipsticks` category collection (currently has 18 scenes with `category_sort_order: 3`). Organized into 4 sub-categories (6 scenes each). Update `category_sort_order` from 3 to 18 per RTF spec.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (6 each) |
|---|---|---|
| Editorial Beauty Product Studio (01-06) | 1 | beauty-editorial-floating-hero, beauty-editorial-surface-shadow-hero, beauty-editorial-texture-closeup, beauty-editorial-swatch-surface, beauty-editorial-reflection-surface, beauty-editorial-grouping-story |
| On-Face / In-Hand Beauty Editorial (07-12) | 2 | beauty-onface-lip-closeup, beauty-inhand-product-portrait, beauty-application-moment, beauty-eye-cheek-crop, beauty-clean-beauty-portrait, beauty-hand-face-gesture |
| Vanity / Daily Beauty UGC (13-18) | 3 | beauty-vanity-mirror-moment, beauty-desk-bag-daily-use, beauty-sunlit-bathroom-routine, beauty-touchup-on-the-go, beauty-flatlay-vanity-essentials, beauty-evening-touchup-lifestyle |
| Aesthetic Color Beauty Stories (19-24) | 4 | beauty-color-surface-still, beauty-color-inhand-story, beauty-color-beauty-portrait, beauty-color-sculptural-set, beauty-color-liquid-energy, beauty-color-hero-campaign |

## Technical Details
- **sort_order**: starts at 2741 (current global max is 2740)
- **category_collection**: `makeup-lipsticks`
- **category_sort_order**: update all makeup-lipsticks scenes from `3` to `18` per RTF
- **Scenes 1-6**: still life / product-only, `detailFocus` trigger on most, no `personDetails`, no `outfit_hint`
- **Scenes 7-12**: on-face/in-hand with `personDetails`, no `outfit_hint` (beauty category)
- **Scenes 13-18**: lifestyle UGC, mix of `personDetails` and product-only; scene 14 uses `stylingDetails` instead of `personDetails`, scene 17 also `stylingDetails`
- **Scenes 19-24**: `aestheticColor` trigger; `suggested_colors` = `[{"name":"Soft Poppy Coral","hex":"#F47C5C"}]`; scenes 19, 22 are product-only stills; scenes 20, 21, 23, 24 include `personDetails`
- Scene 24 scene_type is `campaign`; scenes 13-18 are `lifestyle`; all others are `editorial`
- Full prompt templates extracted from RTF

## Execution
1. UPDATE existing 18 makeup-lipsticks scenes: set `category_sort_order = 18`
2. Single batch INSERT of 24 new rows with full prompt templates, trigger blocks, and suggested colors

