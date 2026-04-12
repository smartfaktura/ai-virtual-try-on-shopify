

# Add 6 Editorial Sneaker Scenes

## Summary
Insert 6 new sneaker editorial scenes into the `product_image_scenes` table via a database migration. All share the same category (`sneakers`), sub-category (`Editorial Series`), category sort order (`19`), and curator color (Buttercream `#D8C86A`).

## Database Migration

One SQL migration inserting 6 rows into `product_image_scenes`:

| Scene ID | Title | Sort | Trigger Blocks |
|---|---|---|---|
| `glass-block-shot` | Glass Block | 160 | aestheticColor, personDetails, sceneEnvironment, visualDirection |
| `pool-ladder-shot` | Pool Ladder | 161 | aestheticColor, personDetails, sceneEnvironment, visualDirection, actionDetails |
| `light-circle-shot` | Light Circle | 162 | aestheticColor, personDetails, sceneEnvironment, visualDirection, layout |
| `acrylic-cube-shot` | Acrylic Cube | 163 | aestheticColor, personDetails, sceneEnvironment, layout, visualDirection |
| `chrome-table-shot` | Chrome Table | 164 | aestheticColor, personDetails, sceneEnvironment, visualDirection |
| `paper-sweep-shot` | Paper Sweep | 165 | aestheticColor, personDetails, sceneEnvironment, layout, visualDirection |

**Shared fields for all 6:**
- `category_collection`: `sneakers`
- `sub_category`: `Editorial Series`
- `scene_type`: `editorial`
- `category_sort_order`: `19`
- `sub_category_sort_order`: `0`
- `is_active`: `true`
- `suggested_colors`: `[{"hex": "#D8C86A", "label": "Buttercream"}]`
- `outfit_hint`: scene-specific outfit direction text (as provided)
- `requires_extra_reference`: `false`
- `use_scene_reference`: `false`

Each scene gets its full prompt template as provided. No code changes needed — just the migration.

## Files Changed
1. New migration SQL file — INSERT 6 rows into `product_image_scenes`

