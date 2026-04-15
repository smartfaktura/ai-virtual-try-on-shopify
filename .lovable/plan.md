

# Merge Wallets in Admin Product Image Scenes

## Problem
`AdminProductImageScenes.tsx` groups scenes by raw `category_collection` values without normalizing through `COLLECTION_MERGE`, so `wallets` and `wallets-cardholders` appear as separate sections.

## Solution

**File: `src/pages/AdminProductImageScenes.tsx`**

Apply the same `COLLECTION_MERGE` normalization used elsewhere in three locations:

1. **Line 159** — In the grouping logic, normalize the key:
   ```typescript
   const key = COLLECTION_MERGE[s.category_collection || ''] ?? s.category_collection || 'other';
   ```

2. **Line 150** — In the filter logic, match via normalized value:
   ```typescript
   scenes = scenes.filter(s => (COLLECTION_MERGE[s.category_collection || ''] ?? s.category_collection) === previewCategory);
   ```

3. **Lines 114-120** — In `subCategoriesByCategory`, normalize the key before building the map.

4. **Line 281** — In `handleMove`, normalize the key for reorder operations.

Add the `COLLECTION_MERGE` constant at the top of the file (or import from `useProductImageScenes`):
```typescript
const COLLECTION_MERGE: Record<string, string> = {
  "snacks-food": "food",
  "food-beverage": "food",
  "wallets": "wallets-cardholders",
};
```

## Impact
- All wallet scenes appear under a single "Wallets & Cardholders" section in the admin panel
- No duplicate scenes — just unified grouping
- Reorder and sub-category features continue to work correctly

