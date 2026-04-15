

# Merge snacks-food into Food & Snacks in Scene Grouping

## Problem
The `buildCollections()` function in `src/hooks/useProductImageScenes.ts` groups scenes by their raw `category_collection` database value. Scenes tagged `snacks-food` (24) appear as a separate section from `food` (16), even though the `CATEGORY_ALIASES` mapping exists — that alias only affects product-to-category detection, not scene grouping.

## Solution

**File: `src/hooks/useProductImageScenes.ts`**

Add a `COLLECTION_MERGE` map and apply it inside `buildCollections()` before grouping:

```typescript
const COLLECTION_MERGE: Record<string, string> = {
  "snacks-food": "food",
  "food-beverage": "food",
};
```

In the `for (const s of scenes)` loop (line 105-116), normalize the category before grouping:

```typescript
const cat = COLLECTION_MERGE[s.category_collection] ?? s.category_collection;
```

This merges all 40 food/snack scenes under the single "Food & Snacks" heading (which is already in the `TITLE_MAP` at line 150).

## Impact
- One constant + one line change in `buildCollections()`
- All food-related scenes appear under a single "Food & Snacks" section with count 40

