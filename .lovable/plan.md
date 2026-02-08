

## Fix: Change Gallery from 2-Column to 3-Column Grid

### Problem
The gallery currently uses CSS `columns-2 lg:columns-3`, which means it only shows 3 columns on screens wider than 1024px. Since the Freestyle page shares screen space with the sidebar, the content area is narrower than 1024px, causing it to fall back to a 2-column masonry layout.

### Solution
Change the default to always use 3 columns, so images display in a 3-across row and continue one by one below.

### File: `src/components/app/freestyle/FreestyleGallery.tsx`

**Line 172** -- Change:
```
columns-2 lg:columns-3
```
to:
```
columns-3
```

This ensures the gallery always renders 3 columns regardless of the viewport breakpoint, matching the expected layout of 3 images across, then continuing row by row.

One line change, no other files affected.
