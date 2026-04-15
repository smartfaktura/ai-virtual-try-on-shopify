

# Redesign Grid Column Options for Step 2 Shots

## Problem
Current grid sizes map to confusing column counts (7/6/5/4) and don't match the user's desired defaults or breakpoints.

## Changes

**File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`**

### 1. Update `GridSize` type and `GRID_CLASSES` (lines 89-96)

Replace with 4 options that map to the user's spec:

| Option | Desktop (lg) | Tablet (md) | Mobile (default) |
|--------|-------------|-------------|-----------------|
| `6col` | 6 | 4 | 3 |
| `5col` | 5 | 4 | 3 |
| `4col` (default) | 4 | 3 | 2 |
| `3col` | 3 | 2 | 2 |

```tsx
type GridSize = '6col' | '5col' | '4col' | '3col';

const GRID_CLASSES: Record<GridSize, string> = {
  '6col': 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  '5col': 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  '4col': 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  '3col': 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3',
};
```

### 2. Update default state (line 334)

Change from `'medium'` to `'4col'`.

### 3. Update `GridSizeToggle` (lines 283-288)

```tsx
const sizes = [
  { id: '6col', dots: [4, 3], title: '6 columns' },
  { id: '5col', dots: [3, 3], title: '5 columns' },
  { id: '4col', dots: [3, 2], title: '4 columns' },
  { id: '3col', dots: [2, 2], title: '3 columns' },
];
```

## Impact
- 1 file changed
- Default view becomes 4 columns on desktop (was 6), better for larger scene previews

