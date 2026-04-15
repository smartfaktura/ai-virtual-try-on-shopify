

# Insert 24 Tech Scenes into Product Image Scenes

## What We're Doing
Adding 24 new tech scenes to `product_image_scenes` under `category_collection: 'tech-devices'`, organized into 4 sub-categories. These join the 16 existing generic tech scenes already in the DB.

## Scenes to Insert (24 total)

**Sub-category 1: Editorial Tech Studio** (sub_category_sort_order: 1)
1. `tech-editorial-front-hero` — Front Tech Hero
2. `tech-editorial-shadow-hero` — Shadow Tech Hero
3. `tech-editorial-material-detail` — Material and Hardware Detail
4. `tech-editorial-floating-object` — Floating Tech Studio
5. `tech-editorial-reflection-surface` — Reflection Surface Tech Still
6. `tech-editorial-grouping-story` — Grouped Tech Composition

**Sub-category 2: Desk / Hand / Daily Use UGC** (sub_category_sort_order: 2)
7. `tech-lifestyle-inhand-hero` — In-Hand Tech Hero
8. `tech-lifestyle-desk-use` — Desk Use Lifestyle
9. `tech-lifestyle-cafe-or-travel` — Café or Travel Use Moment
10. `tech-lifestyle-ear-wear-or-body-use` — Wearable or Body-Use Moment
11. `tech-lifestyle-charging-or-connection` — Charging or Connection Story
12. `tech-lifestyle-bag-pocket-story` — Bag or Pocket Tech Story

**Sub-category 3: Surface / Setup / Product Still Life** (sub_category_sort_order: 3)
13. `tech-still-desk-surface` — Desk Surface Tech Still
14. `tech-still-open-device-or-case` — Open Device or Case Still
15. `tech-still-accessory-paired` — Paired Accessory Composition
16. `tech-still-shelf-placement` — Shelf or Studio Placement
17. `tech-still-material-closeup` — Hardware Material Closeup
18. `tech-still-symmetry-composition` — Symmetry Tech Composition

**Sub-category 4: Aesthetic Color Tech Stories** (sub_category_sort_order: 4)
- Lead color: Graphite Moss (#6F7568)
19. `tech-color-wall-hero` — Color Wall Tech Hero
20. `tech-color-desk-story` — Color Desk Story
21. `tech-color-surface-still` — Color Surface Tech Still
22. `tech-color-shelf-story` — Color Shelf Tech Story
23. `tech-color-reflection-mood` — Color Reflection Mood
24. `tech-color-hero-campaign` — Color Hero Tech Campaign

## Technical Steps

### Database Insert (using insert tool)
- `category_collection`: `'tech-devices'`
- `category_sort_order`: `28` (per the document)
- `is_active`: `true`
- `sort_order`: sequential starting from 200 to avoid conflicts with existing 16 scenes
- Scene types: `editorial`, `lifestyle`, `stilllife`, `campaign`
- Scenes 19-24 get `suggested_colors`: `[{"hex": "#6F7568", "label": "Graphite Moss"}]`
- Full prompt templates extracted from the RTF
- Some lifestyle scenes include `outfit_hint` for styling direction

No code changes needed — `stilllife` and `campaign` scene types already exist in admin dropdowns.

## Impact
- 24 new tech scenes appear under "Tech Devices" in the admin panel alongside existing 16 generic scenes
- All scenes designed for consumer electronics (phones, laptops, earbuds, watches, etc.)
- `tech-devices` category remains separate from all others

