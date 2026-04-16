

# Show 2-Column Grid for Generated Images on Mobile

## Problem
On mobile (390px), the generated images grid uses `grid-cols-3`, making thumbnails cramped and hard to tap/preview.

## Change

### `src/pages/Generate.tsx` — Line 4456

Change the grid classes from:
```
grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6
```
to:
```
grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6
```

This gives 2 columns on mobile (<640px), 3 on small tablets, and keeps the existing 5/6 columns on larger screens.

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Line 4456: `grid-cols-3` → `grid-cols-2 sm:grid-cols-3` |

