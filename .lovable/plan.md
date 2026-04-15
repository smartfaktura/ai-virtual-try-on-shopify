

# Upload 24 Jeans Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `jeans` category collection (currently has 18 scenes with `category_sort_order: 25`). Organized into 6 sub-categories (4 scenes each). Update `category_sort_order` from 25 to 21 per RTF spec.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (4 each) |
|---|---|---|
| Fit & Shape Studio (01-04) | 1 | jeans-fit-seated-stool, jeans-fit-floor-pose, jeans-fit-crouch-editorial, jeans-fit-standing-editorial |
| Editorial Denim Body Crops (05-08) | 2 | jeans-waist-hip-crop, jeans-legline-crop, jeans-back-pocket-crop, jeans-shoe-hem-crop |
| Streetwear UGC Looks (09-12) | 3 | jeans-wall-lean-ugc, jeans-sidewalk-full-look, jeans-candid-walk-ugc, jeans-denim-set-street |
| Folded / Stack / Product Still (13-16) | 4 | jeans-folded-stack-still, jeans-pocket-label-detail, jeans-chair-drape-still, jeans-fabric-surface-detail |
| Aesthetic Color Denim Styling (17-20) | 5 | jeans-aesthetic-chair-look, jeans-aesthetic-minimal-look, jeans-aesthetic-metal-accent, jeans-aesthetic-denim-world |
| Campaign Denim Statements (21-24) | 6 | jeans-campaign-silver-shoe, jeans-campaign-lean-back, jeans-campaign-back-view, jeans-campaign-modern-denim-icon |

## Technical Details
- **sort_order**: starts at 2693 (current global max is 2692)
- **category_collection**: `jeans`
- **category_sort_order**: update all jeans scenes to `21` (currently 25)
- **Scenes 1-4**: `trigger_blocks` include `personDetails`, have `outfit_hint`
- **Scenes 5-8**: `personDetails` + `detailFocus`, have `outfit_hint`; scene 7 also has `backView`
- **Scenes 9-12**: `personDetails`, street UGC with `outfit_hint`
- **Scenes 13-16**: still life, no `personDetails`, no `outfit_hint`; scenes 14, 16 include `detailFocus`
- **Scenes 17-20**: `aestheticColor` + `personDetails` + outfit hint; scene 18 also has `background` trigger
- **Aesthetic color**: `suggested_colors` = `[{"name":"Muted Pewter Blue","hex":"#7E8C98"}]` for scenes 17-20
- **Scenes 21-24**: campaign with `personDetails` + outfit hint; scene 23 includes `backView`
- Full prompt templates extracted from RTF

## Execution
1. UPDATE existing 18 jeans scenes: set `category_sort_order = 21`
2. Single batch INSERT of 24 new rows with full prompt templates, trigger blocks, outfit hints, and suggested colors

