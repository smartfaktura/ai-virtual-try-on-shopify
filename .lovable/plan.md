

# Upload 24 Hoodies Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `hoodies` category collection (currently has 15 scenes with `category_sort_order: 23`). Organized into 6 sub-categories. Update `category_sort_order` from 23 to 18 per RTF spec.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (4 each) |
|---|---|---|
| Cozy Lifestyle Editorial (01-04) | 1 | boucle-lounge-portrait, oversized-standing-interior, lounge-floor-reading, minimal-wall-seated |
| Street / Off-Duty UGC (05-08) | 2 | crosswalk-overhead-ugc, stairwell-offduty, mirror-travel-ugc, cafe-lounge-ugc |
| Folded / Hanger / Product Still (09-12) | 3 | hanger-rail-still, folded-grid-still, fabric-detail-still, rail-and-set-still |
| Aesthetic Color Comfort Sets (13-16) | 4 | aesthetic-set-lounge, aesthetic-travel-set, aesthetic-outdoor-comfort, aesthetic-home-story |
| Graphic Campaign Looks (17-20) | 5 | bold-graphic-hero, yacht-knit-campaign, sport-knit-sun-campaign, power-back-graphic |
| Travel / Transit Comfort (21-24) | 6 | airplane-window-comfort, private-jet-lounge, airport-tarmac-walk, hotel-arrival-transit |

## Technical Details

- **sort_order**: starts at 2645 (current global max is 2644)
- **category_collection**: `hoodies`
- **category_sort_order**: update all hoodies scenes to `18` (currently 23)
- **Scenes 1-8**: `trigger_blocks` include `personDetails`, have `outfit_hint`
- **Scenes 9-12**: still life, no `personDetails`, no `outfit_hint`
- **Scenes 13-16**: `aestheticColor` trigger, `suggested_colors` = `[{"name":"Oat Milk Beige","hex":"#D8CCBD"}]`, with `personDetails` + outfit hint
- **Scenes 17-20**: graphic campaign with `personDetails` + outfit hint; scene 20 includes `backView` trigger
- **Scenes 21-24**: travel comfort with `personDetails` + outfit hint
- Scene 11 includes `detailFocus` trigger block
- Full prompt templates extracted from document

## Execution
1. UPDATE existing 15 hoodies scenes: set `category_sort_order = 18`
2. Single batch INSERT of 24 new rows with full prompt templates, trigger blocks, outfit hints, and suggested colors

