

# Merge Duplicate Food Categories in Scene Selection

## Problem
The database has three `category_collection` values for food-related scenes:
- `food` (16 scenes) — displayed as "Food & Snacks"
- `snacks-food` (24 scenes) — displayed as raw slug "snacks-food" (no alias)
- `food-beverage` (16 scenes) — already aliased to `food`

Because `snacks-food` has no alias, it appears as a separate category section instead of merging with "Food & Snacks".

## Solution

**File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`**

Add one line to `CATEGORY_ALIASES`:
```typescript
"snacks-food": "food",
```

This merges all 40 food scenes (16 from `food` + 24 from `snacks-food`) under the single "Food & Snacks" category tab. The `food-beverage` alias already exists.

## Impact
- One-line change
- Users see a single "Food & Snacks" section with all 40 scenes instead of two separate sections

