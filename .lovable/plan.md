

# Upload 24 High Heels Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `high-heels` category collection (currently has 18 "Essential Shots" with `category_sort_order: 21`). Organized into 6 sub-categories. Keep `category_sort_order` at 21 as specified in RTF.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (4 each) |
|---|---|---|
| Editorial Heel Studio (01-04) | 1 | seated-chair-editorial, standing-minimal-editorial, windowlight-studio, monochrome-glam-studio |
| Leg-Line Poses (05-08) | 2 | legs-up-editorial, crossed-leg-fashion, hosiery-leg-crop, reclined-leg-editorial |
| Social Lifestyle Heel Moments (09-12) | 3 | bedroom-lifestyle, lounge-chair-lifestyle, morning-ritual-lifestyle, outfit-corner-social |
| Luxury Still Life (13-16) | 4 | box-tissue-stilllife, book-perfume-stilllife, bedlinen-stilllife, bathroom-counter-stilllife |
| Color Heel Stories (17-20) | 5 | aesthetic-chair-story, aesthetic-floor-light, aesthetic-leg-glamour, aesthetic-luxury-still |
| Glamour Campaign (21-24) | 6 | black-glam-campaign, animalprint-campaign, red-glamour-campaign, iconic-glam-finisher |

## Technical Details
- **sort_order**: starts at 2621 (current global max is 2620)
- **category_collection**: `high-heels`
- **category_sort_order**: remains `21` (already correct)
- **Scenes 1-12**: `trigger_blocks` include `personDetails`, have `outfit_hint`
- **Scenes 13-16**: still life, no `personDetails`, no `outfit_hint`
- **Scenes 17-20**: `aestheticColor` trigger, `suggested_colors` = `[{"name":"Smoky Mauve Nude","hex":"#B9989A"}]`
  - Scene 17, 19: with `personDetails` + outfit hint
  - Scene 18, 20: still life, no person
- **Scenes 21-24**: campaign with `personDetails` + outfit hint
- Full prompt templates extracted from RTF

## Execution
1. Single batch INSERT of 24 new rows (no UPDATE needed since `category_sort_order` is already 21)

