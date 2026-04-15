

# Upload 24 Dresses Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `dresses` category collection (currently has 18 "Essential Shots"). Organized into 4 sub-categories. Update `category_sort_order` from 22 to 21 per RTF spec.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (6 each) |
|---|---|---|
| Editorial Dress Portraits (01-06) | 1 | front-portrait, seated-legline, side-profile-study, collarbone-neckline-crop, standing-leg-accent, back-view |
| Lifestyle / Social Dress Moments (07-12) | 2 | sidewalk-walk, wall-lean, cafe-terrace, stair-corridor, resort-outdoor, hands-adjusting |
| Styled Dress Still Life (13-18) | 3 | hanger-rail, chair-drape, folded-surface, wardrobe-placement, detail-neckline-hem, one-object-style |
| Aesthetic Color Dress Stories (19-24) | 4 | color-wall-portrait, color-lounge-chair-story, color-surface-still, color-entry-corridor, color-reflection-mood, color-hero-campaign |

## Technical Details

- **sort_order**: starts at 2597 (current global max is 2596)
- **category_collection**: `dresses`
- **category_sort_order**: update all dresses scenes to `21` (currently 22)
- **Aesthetic color scenes** (19-24): `suggested_colors` = `[{"name":"Rosewood Sand","hex":"#B88F84"}]`
- **outfit_hint**: scenes 1-12, 19-20, 22, 24 have outfit directions; scenes 13-18, 21, 23 are still life or no outfit hint
- **trigger_blocks**: mapped per scene from RTF
- Full prompt templates extracted from document

## Execution
1. UPDATE existing 18 dresses scenes: set `category_sort_order = 21`
2. Single batch INSERT of 24 new rows

