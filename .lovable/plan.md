## Problem

The auto-fetch effect we added causes a visible "Loading..." spinner and overlay when the Favorites tab is active, because the fetching indicators (`isFetching`, `isFetchingNextPage`) are displayed unconditionally.

## Fix

Two changes in `src/pages/Jobs.tsx`:

1. **Hide the overlay spinner during auto-fetch** (line 600): Change the condition from `isFetching && !isLoading` to `isFetching && !isLoading && smartView === 'all'` — so the full-screen spinner only shows on the "All" tab where the user manually triggered it.

2. **Hide the "Load More" button during auto-fetch** (line 641): Change `hasNextPage` to `hasNextPage && smartView === 'all'` — since filtered views auto-fetch all pages, the manual button is unnecessary and just shows a perpetual loading state.
