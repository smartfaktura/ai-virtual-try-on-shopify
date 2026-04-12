

# Fix Scene Sorting Glitch in Admin Panel

## Problem
The up/down sorting buttons are broken when scenes are grouped by sub-category. Two issues:

1. **Wrong swap target**: The UI passes `idx` scoped to the sub-category group (e.g., position 2 of 5 within "Essential Shots"), but `handleMove` looks up the scene in the flat category-level array (all sub-categories combined). It finds the scene at a different index and swaps it with the wrong neighbor — often a scene from a different sub-category.

2. **Duplicate sort_order values**: If two scenes share the same `sort_order`, swapping their values produces no visible change, causing the "glitch" feel.

## Solution

**File: `src/pages/AdminProductImageScenes.tsx`**

### 1. Make `handleMove` sub-category-aware

Instead of searching the flat category array, filter to only scenes in the same sub-category before finding the swap partner:

```
handleMove(scene, direction):
  - Get all scenes in the same category_collection
  - Filter to only scenes with the same sub_category
  - Sort by sort_order
  - Find scene index within this filtered list
  - Swap sort_order with the adjacent scene in the same sub-category
```

### 2. Handle equal sort_order values

When swapping, if both scenes have the same `sort_order`, assign explicit sequential values instead of just swapping:

```
if a.sort_order === b.sort_order:
  assign a = b.sort_order + (direction === 'up' ? -1 : +1)
```

### 3. Normalize sort_order on edge cases

When sort_order values collide or scenes have been imported with all-zero sort orders, re-index the entire sub-group sequentially before performing the swap.

## Result
Up/down arrows will correctly move scenes within their sub-category group only, with no cross-sub-category glitches.

