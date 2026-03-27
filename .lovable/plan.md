

# Fix: Discover Category Not Saving on the Actual Discover Item

## Problem
There are two separate "Discover Category" fields being saved to different places:

1. **AddSceneModal** saves `discover_categories` (text array) to the `custom_scenes` table — but this field is **never read** by the Discover feed filtering logic.
2. **DiscoverDetailModal** saves `category` (single text) to the `discover_presets` table — this IS what filtering uses.

So when you set a Discover Category in the "Add as Scene" modal, it gets stored in `custom_scenes.discover_categories` but the Discover feed filters by `item.data.category`, which for scenes comes from `custom_scenes.category` (the Freestyle category like "studio", "lifestyle"), not the product-focused discover categories.

## Fix

**`src/components/app/AddSceneModal.tsx`** — When saving a new scene, also set the `category` field to the first selected discover category (mapped to the matching Discover filter key). This ensures the scene appears under the correct Discover filter tab.

**`src/components/app/DiscoverDetailModal.tsx`** — When saving metadata for a custom scene, also update `custom_scenes.discover_categories` alongside `category`, so both fields stay in sync.

### Detailed changes

1. **AddSceneModal.tsx**: Map the first selected `discoverCategories` entry to the corresponding filter key (e.g., "Fashion & Apparel" → "fashion") and pass it as the scene's `category` field, so the scene immediately shows under the right Discover tab.

2. **DiscoverDetailModal.tsx** (scene save path, ~line 654-662): When updating `custom_scenes`, also sync the `discover_categories` array from the selected `editCategory` value, keeping both fields consistent.

3. **Discover feed filtering** (`itemMatchesProductCategory`): Optionally enhance to also check `discover_categories` array on scene items, providing a secondary match path for scenes that have this field populated.

This is a 2-file change (~10 lines added/modified).

