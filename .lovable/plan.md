

# Show ALL product scenes in workflow grid

## Root cause

The merge logic in `Generate.tsx` line 428 uses a hardcoded list of 15 "product" category slugs:

```typescript
const PRODUCT_SCENE_CATEGORIES: PoseCategory[] = ['clean-studio', 'surface', 'flat-lay', 'product-editorial', 'kitchen', ...];
```

Any scene with a category NOT in this list (e.g. admin-created custom categories, or scenes with `category_override` to non-listed slugs like "Skyline Laundry") gets filtered out. The same problem exists in the Freestyle `SceneSelectorChip` Product tab (only 4 categories).

## Fix: derive product categories dynamically

The on-model categories are a small, stable set: `studio`, `lifestyle`, `editorial`, `streetwear`. Everything else is a product scene. Instead of listing product categories, exclude on-model ones.

### File 1: `src/pages/Generate.tsx` (~line 428)

Replace the hardcoded `PRODUCT_SCENE_CATEGORIES` filter with a negative filter:

```typescript
const ON_MODEL_CATEGORIES: PoseCategory[] = ['studio', 'lifestyle', 'editorial', 'streetwear'];

// Filter: any scene NOT in on-model categories is a product scene
.filter(s => !ON_MODEL_CATEGORIES.includes(s.category))
```

This ensures every product scene — including admin-created custom categories — appears in the workflow grid automatically.

### File 2: `src/components/app/freestyle/SceneSelectorChip.tsx` (~line 86-90)

Same fix for the Freestyle Product tab filter. Currently hardcoded to 4 categories:

```typescript
product: ['clean-studio', 'surface', 'flat-lay', 'product-editorial'],
```

Change to dynamic: when `activeFilter === 'product'`, show all scenes whose category is NOT in the on-model set, instead of matching against a fixed list.

### File 3: `src/components/app/CreativeDropWizard.tsx` (~line 312)

Same pattern — replace `PRODUCT_CATEGORIES` hardcoded list with the inverse of `ON_MODEL_CATEGORIES`.

## Summary

Three files, same one-line logic change in each: flip from "include these product categories" to "exclude on-model categories". This makes every non-on-model scene appear as a product scene everywhere — workflow grid, Freestyle picker, and Creative Drops. New admin-created categories will automatically be included.

