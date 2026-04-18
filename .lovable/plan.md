
The Recent Creations modal opens inside the dashboard container instead of full-viewport. Previous fix was for `DiscoverDetailModal` / `PublicDiscoverDetailModal`, but Recent Creations uses `LibraryDetailModal` (see `RecentCreationsGallery.tsx`). Need to apply the same `createPortal` fix there.

### Fix
- `src/components/app/LibraryDetailModal.tsx`: wrap returned JSX in `createPortal(..., document.body)` so the fixed-position modal escapes the dashboard's container constraints.

### Files touched
- `src/components/app/LibraryDetailModal.tsx`
