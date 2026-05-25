## Goal
Polish the Brand Scenes card meta line: uppercase date and show the scene's subcategory instead of the high-level module ("fashion").

## Changes — `src/pages/BrandScenes.tsx`

1. **Query**: add `category_collection` to the select and to `BrandSceneRow` (alongside existing `brand_scene_module`).
2. **Meta line** (lines ~194–201): render the date in uppercase (e.g. `MAY 25, 2026`) using `toLocaleDateString(...).toUpperCase()`, with tighter tracking to match our small-caps label style. After the dot separator, show `category_collection` (the wizard's `sub_family`, e.g. "apparel", "shoes") instead of `brand_scene_module`. Fall back to module only if subcategory is missing.

## Out of scope
- No schema, RLS, or wizard changes.
- Other scene cards (catalog, library) untouched.
