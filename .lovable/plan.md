

# Fix: Toolbar Controls Not Aligned to Right Edge

## Problem
The search bar + sort/grid/select toolbar uses `flex flex-wrap items-center gap-2` but the search input has `sm:max-w-md sm:flex-1` and the controls div has no alignment. This means on wide screens, the controls sit right after the search bar instead of pushing to the right edge of the container — leaving empty space on the right.

## Fix

### `src/pages/Jobs.tsx` (line 263)

Add `justify-between` to the toolbar wrapper so the search bar takes the left side and controls push to the right:

```tsx
// Before
<div className="flex flex-wrap items-center gap-2 sm:gap-3">

// After  
<div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
```

One line change. The search input already has `sm:flex-1` so it will grow to fill available space, and the controls group will be pushed to the far right.

