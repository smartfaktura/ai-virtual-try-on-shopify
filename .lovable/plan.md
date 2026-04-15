

# Add 24 Furniture Scenes & Ensure Home Decor / Furniture Separation

## What We're Doing

Adding 24 new furniture scenes from the uploaded document to the database, organized into 4 sub-categories. The `furniture` category already exists in the codebase — this task is about populating it with scenes and ensuring `home-decor` remains separate for smaller items.

## Scenes to Insert (24 total)

**Sub-category 1: Editorial Room Heroes** (sub_category_sort_order: 1)
1. `furniture-editorial-room-hero-front` — Front Room Hero
2. `furniture-editorial-corner-placement` — Corner Placement Editorial
3. `furniture-editorial-wide-architectural` — Wide Architectural Room Story
4. `furniture-editorial-material-close-room` — Material and Form Interior Crop
5. `furniture-editorial-window-light` — Window Light Furniture Portrait
6. `furniture-editorial-empty-space-hero` — Empty Space Hero

**Sub-category 2: Lived-In Interior Lifestyle** (sub_category_sort_order: 2)
7. `furniture-lifestyle-livedin-room` — Lived-In Room Story
8. `furniture-lifestyle-coffee-table-context` — Coffee Table Context Room
9. `furniture-lifestyle-reading-corner` — Reading Corner Lifestyle
10. `furniture-lifestyle-dining-context` — Dining or Gathering Context
11. `furniture-lifestyle-bedroom-context` — Bedroom Context Lifestyle
12. `furniture-lifestyle-evening-ambience` — Evening Ambience Room Story

**Sub-category 3: Studio / Empty Space Furniture Still** (sub_category_sort_order: 3)
13. `furniture-still-studio-isolated` — Studio Isolated Furniture Hero
14. `furniture-still-stone-platform` — Stone Platform Furniture Still
15. `furniture-still-material-detail` — Material Detail Furniture Still
16. `furniture-still-symmetry-composition` — Symmetry Composition Still
17. `furniture-still-empty-room-placement` — Empty Room Placement Still
18. `furniture-still-one-object-support` — One Object Support Still

**Sub-category 4: Aesthetic Color Furniture Stories** (sub_category_sort_order: 4)
- Lead color: Mineral Clay Taupe (#A59284)
19. `furniture-color-wall-room-hero` — Color Wall Room Hero
20. `furniture-color-lounge-story` — Color Lounge Interior Story
21. `furniture-color-surface-still` — Color Surface Furniture Still
22. `furniture-color-entry-corridor` — Color Corridor Furniture Story
23. `furniture-color-reflection-mood` — Color Reflection Mood
24. `furniture-color-hero-campaign` — Color Hero Furniture Campaign

## Technical Steps

### 1. Database Migration — Insert 24 scenes
- `category_collection`: `'furniture'`
- `category_sort_order`: `26` (as specified in the document)
- `is_active`: `true`
- `sort_order`: sequential starting from a high offset to avoid conflicts
- Scene types: `editorial`, `lifestyle`, `stilllife`, `campaign` (matching the document)
- Scenes 19-24 get `suggested_colors`: `[{"hex": "#A59284", "label": "Mineral Clay Taupe"}]`
- Full prompt templates extracted from the RTF

### 2. Admin Scene Types — Add missing types
**File: `src/pages/AdminProductImageScenes.tsx`** (line 29)
- Add `'stilllife'` and `'campaign'` to `SCENE_TYPES` array

**File: `src/components/app/ImportFromScenesModal.tsx`** (line 17)
- Same addition for consistency

### 3. Verify home-decor separation
The `home-decor` category already exists separately with its own scenes. The furniture scenes use `category_collection: 'furniture'` — no overlap. The `COLLECTION_MERGE` map does NOT merge these two, keeping them distinct.

## Impact
- 24 new furniture scenes appear under "Furniture" in the admin panel
- Home Decor remains its own separate category with existing smaller-item scenes
- `stilllife` and `campaign` scene types become selectable in admin dropdowns

