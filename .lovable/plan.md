

# Hide Non-Functional Grid Size Buttons on Mobile

## Problem
The shots grid selector shows 4 column options (6, 5, 4, 3) on mobile, but on mobile screens they only produce 2 actual layouts: `grid-cols-3` (for 6col/5col) and `grid-cols-2` (for 4col/3col). Two pairs of buttons do the same thing, which is confusing.

## Fix

### File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

**1. Update `GridSizeToggle` to filter options on mobile** — use `useIsMobile()` to show only 2 options (`3col` and `5col`) on mobile, representing the actual 2-col and 3-col layouts:

```tsx
function GridSizeToggle({ value, onChange }: { value: GridSize; onChange: (v: GridSize) => void }) {
  const isMobile = useIsMobile();
  
  const sizes: { id: GridSize; dots: [number, number]; title: string }[] = isMobile
    ? [
        { id: '5col', dots: [3, 3], title: '3 columns' },
        { id: '3col', dots: [2, 2], title: '2 columns' },
      ]
    : [
        { id: '6col', dots: [4, 3], title: '6 columns' },
        { id: '5col', dots: [3, 3], title: '5 columns' },
        { id: '4col', dots: [3, 2], title: '4 columns' },
        { id: '3col', dots: [2, 2], title: '3 columns' },
      ];
  // ... rest unchanged
}
```

This reduces the toggle to 2 meaningful options on mobile (2-col vs 3-col grid), matching actual behavior.

### Files
- `src/components/app/product-images/ProductImagesStep2Scenes.tsx` — filter grid toggle options by device

