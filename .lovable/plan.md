

# Insert 24 Home Decor Scenes from RTF Document

## What We're Doing
Adding 24 new home decor scenes to the `product_image_scenes` table under `category_collection: 'home-decor'`, organized into 4 sub-categories. These are separate from the 16 existing generic home-decor scenes already in the DB.

## Scenes to Insert (24 total)

**Sub-category 1: Editorial Object Studio** (sub_category_sort_order: 1)
1. `decor-editorial-front-hero` — Front Object Hero
2. `decor-editorial-shadow-hero` — Shadow Object Hero
3. `decor-editorial-material-detail` — Material Detail Object Crop
4. `decor-editorial-platform-presentation` — Platform Presentation
5. `decor-editorial-windowlight-object` — Window Light Object Portrait
6. `decor-editorial-empty-space-object` — Empty Space Object Hero

**Sub-category 2: Console / Table / Shelf Lifestyle** (sub_category_sort_order: 2)
7. `decor-lifestyle-console-placement` — Console Placement Story
8. `decor-lifestyle-coffee-table` — Coffee Table Decor Story
9. `decor-lifestyle-shelf-niche` — Shelf or Niche Styling
10. `decor-lifestyle-bedside-placement` — Bedside or Side Table Story
11. `decor-lifestyle-dining-sideboard` — Dining Sideboard Styling
12. `decor-lifestyle-evening-ambience` — Evening Ambience Decor Story

**Sub-category 3: Grouped Styling Still Life** (sub_category_sort_order: 3)
13. `decor-still-paired-objects` — Paired Objects Composition
14. `decor-still-tray-composition` — Tray Styling Composition
15. `decor-still-books-and-object` — Books and Object Still
16. `decor-still-symmetry-group` — Symmetry Group Composition
17. `decor-still-textile-and-object` — Textile and Object Story
18. `decor-still-one-object-support` — One Object Support Still

**Sub-category 4: Aesthetic Color Decor Stories** (sub_category_sort_order: 4)
- Lead color: Dusty Olive Plaster (#9A9882)
19. `decor-color-wall-hero` — Color Wall Decor Hero
20. `decor-color-console-story` — Color Console Story
21. `decor-color-surface-still` — Color Surface Decor Still
22. `decor-color-shelf-story` — Color Shelf Story
23. `decor-color-reflection-mood` — Color Reflection Mood
24. `decor-color-hero-campaign` — Color Hero Decor Campaign

## Technical Steps

### Database Insert (using insert tool)
- `category_collection`: `'home-decor'`
- `category_sort_order`: `27` (per the document)
- `is_active`: `true`
- `sort_order`: sequential starting from 200 to avoid conflicts with existing 16 scenes
- Scene types: `editorial`, `lifestyle`, `stilllife`, `campaign`
- Scenes 19-24 get `suggested_colors`: `[{"hex": "#9A9882", "label": "Dusty Olive Plaster"}]`
- Full prompt templates extracted from the RTF

No code changes needed — `stilllife` and `campaign` scene types were already added in the previous furniture update.

## Impact
- 24 new home decor scenes appear under "Home Decor" in the admin panel alongside the existing 16 generic scenes
- All scenes are specifically designed for smaller tabletop/console decor items
- The `home-decor` and `furniture` categories remain fully separate

