

## Simplify Scene Filter Tabs to 3

**File**: `src/components/app/freestyle/SceneSelectorChip.tsx`

Remove "Food & Home" and "Beauty" from `filterTabs` and `filterCategoryMap`. Keep only All, On-Model, and Product. Scenes from removed categories will still appear under "All".

**Changes:**

```tsx
// filterTabs: remove food-home and beauty entries
const filterTabs: { key: SceneFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'on-model', label: 'On-Model' },
  { key: 'product', label: 'Product' },
];

// SceneFilter type: remove 'food-home' | 'beauty'
type SceneFilter = 'all' | 'on-model' | 'product';

// filterCategoryMap: remove food-home and beauty keys
const filterCategoryMap: Record<SceneFilter, PoseCategory[]> = {
  all: [],
  'on-model': ['studio', 'lifestyle', 'editorial', 'streetwear'],
  product: ['clean-studio', 'surface', 'flat-lay'],
};
```

Single file, three constant updates.

