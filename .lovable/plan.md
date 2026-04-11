

# Library Redesign — Scope Clarification

## What stays the same (no changes)
- `useLibraryItems` hook — all data fetching, pagination, sorting, search logic untouched
- Delete logic (single + bulk) — identical
- Bulk download ZIP — identical
- Upscale flow — identical
- `LibraryDetailModal` — no structural changes
- Column layout system — same masonry approach

## What changes — purely UI + two small additions

### 1. UI-only changes in `src/pages/Jobs.tsx`
- **Header text**: "Library" → "My Library" + new subtitle
- **Smart view tabs** (All / Favorites / Brand Ready / Ready to Publish) replace current source filter pills — these are client-side filters on top of existing data
- **Search placeholder** updated
- **Filter popover** reorganized (Product, Type, Status, Source)
- **Grid gap** widened from `gap-1` to `gap-2`
- **Loading overlay** removed (the opacity dim)
- **Floating bar** gets 2 new buttons (Favorite, Mark Status) alongside existing Download/Delete/Enhance

### 2. UI-only changes in `src/components/app/LibraryImageCard.tsx`
- Add heart icon on hover (top-right)
- Add small status pill on hover (bottom-left)
- Move delete button from card hover → detail modal only

### 3. Two new DB tables (small)
- `library_favorites` — just `user_id + image_id`, enables the Favorites tab
- `library_asset_status` — `user_id + image_id + status`, enables Brand Ready / Ready to Publish tabs

### 4. Two small hooks
- `useLibraryFavorites` — fetches favorite IDs as a Set, toggle function
- `useLibraryAssetStatus` — fetches status map, set/bulk-set function

**Bottom line**: The main data engine is untouched. This is a visual redesign + two lightweight state tables for favorites/status.

