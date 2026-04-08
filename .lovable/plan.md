

# Fix Sub-Category Reorder — Remove Forced "Uncategorized Last" Override

## Root Cause
Both `groupBySubCategory()` in `AdminProductImageScenes.tsx` and `buildCollections()` in `useProductImageScenes.ts` have a hardcoded sort rule:
```typescript
if (a._isGeneral !== b._isGeneral) return a._isGeneral ? 1 : -1;
```
This **always** pushes empty-label groups to the bottom, ignoring `sub_category_sort_order`. So clicking the arrows updates the database, but the UI re-sorts with the override and nothing visually changes.

## Fix
Remove the `_isGeneral`/`_isEmpty` sort override from both files. Sort purely by `sub_category_sort_order`. If users want "Uncategorized" last, it naturally stays last because it already has a higher sort order value.

### Files to change

**1. `src/pages/AdminProductImageScenes.tsx`** — `groupBySubCategory` function (~line 86-88):
Remove the `_isEmpty` priority sort. Sort only by `sortOrder`.

**2. `src/hooks/useProductImageScenes.ts`** — `buildCollections` function (~line in subGroups sort):
Remove the `_isGeneral` priority sort. Sort only by `_groupOrder`.

Two small edits, both removing one line each.

