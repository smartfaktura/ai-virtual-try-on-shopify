

# Upload 24 Boots Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `boots` category collection, organized into 6 sub-categories. The existing 33 "Essential Shots" remain unchanged. Update `category_sort_order` to 23 as specified.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (4 each) |
|---|---|---|
| Leg & Outfit (1-4) | 1 | trouser-seated, mini-skirt-leg, longline-coat, crossed-leg-sofa |
| Off-Duty Street (5-8) | 2 | sidewalk-walk-ugc, mirror-hallway, curbside-standing, cafe-doorway |
| Styled Still (9-12) | 3 | chair-still-life, floor-garment-drop, upright-pair-still, bag-pair-still |
| Color Stories (13-16) | 4 | aesthetic-chair, aesthetic-floor-tone, aesthetic-outfit-accent, aesthetic-wall-scene |
| Power Looks (17-20) | 5 | power-hero-stance, dramatic-wide-pose, dramatic-stride, minimal-wall-campaign |
| Vintage Film (21-24) | 6 | vintage-hotel-flash, warm-analog-indoor, retro-street-film, faded-editorial-story |

## Technical Details
- **sort_order**: starts at 2549 (current max is 2548)
- **category_sort_order**: update all boots scenes to 23
- **Aesthetic color scenes** (13-16): suggested_colors `[{"name":"Muted Moss Stone","hex":"#8E9A84"}]`
- **outfit_hint**: scenes 1-8, 15-24 have outfit directions; scenes 9-14 are still life (empty)
- **trigger_blocks**: mapped per scene from RTF
- Single batch INSERT + UPDATE existing boots `category_sort_order` to 23

## Execution
1. UPDATE existing 33 boots scenes: set `category_sort_order = 23`
2. INSERT 24 new rows with full prompt templates, trigger blocks, outfit hints, and suggested colors

