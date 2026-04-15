

# Upload 24 Jackets Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `jackets` category collection (currently has 18 "Essential Shots" with `category_sort_order: 26`). Organized into 4 sub-categories (6 scenes each). Keep `category_sort_order` at 26 as specified in RTF.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (6 each) |
|---|---|---|
| Editorial Outerwear Portraits (01-06) | 1 | editorial-front-portrait, editorial-seated-portrait, editorial-side-profile, editorial-collar-closeup, editorial-open-layering, editorial-back-view |
| Street UGC Layering (07-12) | 2 | ugc-sidewalk-walk, ugc-wall-lean, ugc-coffee-run, ugc-stair-corridor, ugc-travel-layering, ugc-hands-in-pockets |
| Hanger / Chair / Styled Still (13-18) | 3 | still-hanger-rail, still-chair-drape, still-folded-surface, still-shelf-placement, still-closure-detail, still-one-object-style |
| Aesthetic Color Outerwear Stories (19-24) | 4 | color-wall-portrait, color-lounge-chair, color-surface-still, color-entry-corridor, color-reflection-mood, color-hero-campaign |

## Technical Details
- **sort_order**: RTF specifies 2601-2624 but global max is 2668; will use 2669-2692 to avoid collisions
- **category_collection**: `jackets`
- **category_sort_order**: remains `26` (already correct)
- **Scenes 1-12**: `trigger_blocks` include `personDetails`, have `outfit_hint`
- **Scenes 13-18**: still life, no `personDetails`, no `outfit_hint`
- **Scenes 19-20, 22, 24**: `aestheticColor` + `personDetails` + outfit hint
- **Scenes 21, 23**: `aestheticColor`, still life / no person, no outfit hint
- **Aesthetic color**: `suggested_colors` = `[{"name":"Dusty Slate Olive","hex":"#8A8F7A"}]` for scenes 19-24
- Full prompt templates extracted from RTF

## Execution
1. Single batch INSERT of 24 new rows (no UPDATE needed since `category_sort_order` is already 26)

