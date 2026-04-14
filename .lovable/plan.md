

# Short Film Reference Panel — Broken Library Pickers

## Problems Found

### 1. Scene Library shows empty cards (your screenshot)
The scene picker dialog renders ALL 859 active scenes from `product_image_scenes`. Only 186 have `preview_image_url`. The filter `allScenes.filter(s => s.previewUrl)` catches the null ones, but scenes with empty strings or broken URLs still render as empty skeleton-like cards. The real fix: only show scenes that have a valid preview image, and add a loading/empty state.

### 2. Model Library only shows custom models
`ReferenceUploadPanel` uses `useCustomModels()` which only queries the `custom_models` table. It completely ignores:
- Built-in models from `mockModels` (mockData.ts) — the main model library
- Sort order, image overrides, name overrides, and hidden status from `useModelSortOrder`
- User-uploaded models from `useUserModels`

The Product Images page merges all three sources. The short film picker should do the same.

### 3. No product integration
The "Product References" section only has file upload. It should also offer a "Library" button to pick from existing user products (same as `ProductSelectorChip` uses from `user_products` table).

## Plan

### File: `src/components/app/video/short-film/ReferenceUploadPanel.tsx`

**A. Fix Model Picker**
- Import `mockModels` from `@/data/mockData`
- Import `useModelSortOrder` and `useUserModels`
- Merge all model sources the same way `ProductImages.tsx` does: `sortModels(filterHidden(applyNameOverrides(applyOverrides([...mockModels, ...customModelProfiles, ...userModelProfiles]))))`
- Update `pickModel` to use `ModelProfile` shape (`modelId`, `previewUrl`, `name`) instead of `CustomModel` shape
- Add loading skeleton while models load

**B. Fix Scene Picker**
- Filter scenes to only those with a truthy `previewUrl` that starts with `http` (eliminates empty strings / broken refs)
- Add a loading state while scenes fetch
- If no scenes have previews, show a clear "No scene previews available" message instead of an empty grid

**C. Add Product Library button**
- Add `libraryType: 'product'` to the Product References section config
- Import `useUserProducts` hook
- Add a product picker dialog similar to scene/model pickers
- When a product is picked, add its `image_url` as a product reference

**D. Visual polish**
- Add `ShimmerImage` to all picker grids for graceful loading
- Use `grid-cols-2 sm:grid-cols-3` for better mobile layout in picker dialogs
- Add `focus-visible:ring-2` to all picker buttons

### Files to change

| File | Change |
|------|--------|
| `src/components/app/video/short-film/ReferenceUploadPanel.tsx` | Merge all model sources, filter broken scene previews, add product picker, add loading states |

No other files need changes — hooks already exist and are reusable.

