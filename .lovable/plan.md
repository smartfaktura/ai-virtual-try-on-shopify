

# Fix Food Category Merging in Bulk Preview Upload

## Problem
`AdminBulkPreviewUpload.tsx` reads raw `category_collection` values directly, so `food`, `snacks-food`, and `food-beverage` show as separate categories in the dropdown. The `COLLECTION_MERGE` map from `useProductImageScenes.ts` is not applied here.

## Solution

**File: `src/pages/AdminBulkPreviewUpload.tsx`**

1. Import and reuse the `COLLECTION_MERGE` map from `useProductImageScenes.ts` (or define locally)
2. In the `categories` useMemo (line 142), normalize `category_collection` through the merge map before building the set — so `snacks-food` and `food-beverage` both resolve to `food`
3. In the `categoryScenes` useMemo (line 165), filter using the same normalization — match scenes whose merged category equals the selected category

Changes are ~5 lines: add the merge map lookup in both the category builder and the scene filter.

## Technical Detail

```typescript
// At top, or import from useProductImageScenes
const COLLECTION_MERGE: Record<string, string> = {
  "snacks-food": "food",
  "food-beverage": "food",
};

// In categories useMemo: normalize before adding to set
const merged = COLLECTION_MERGE[s.category_collection] ?? s.category_collection;
catSet.add(merged);

// In categoryScenes useMemo: match via normalized value
return rawScenes.filter(s => {
  const merged = COLLECTION_MERGE[s.category_collection ?? ''] ?? s.category_collection;
  return merged === category && s.is_active;
});
```

Result: "Food & Snacks" appears once in the dropdown and includes all 40 scenes.

