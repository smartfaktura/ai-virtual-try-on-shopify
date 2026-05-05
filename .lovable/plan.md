## Problem

The Library search input unmounts when `isInitialLoading` becomes `true` during a search query change. This happens because:

1. The search bar is wrapped in `!isTrulyEmpty && !isInitialLoading` (line 439), so it disappears when loading
2. When a search returns 0 results and the user types the next character, `keepPreviousData` preserves the empty array, `isFetching` is true, so `isInitialLoading = (isLoading || isFetching) && allItems.length === 0` becomes true
3. The search input is unmounted and replaced by `LibrarySkeletonGrid`, causing focus loss

## Fix (src/pages/Jobs.tsx)

1. **Always show the search bar and smart view tabs** -- Remove `!isInitialLoading` from the conditional guards on lines 400 and 439. The search bar and filter controls should render regardless of loading state.

2. **Refine `isInitialLoading`** -- Only treat it as initial loading when there's no active search query and no filters. Change to:
   ```
   const isInitialLoading = (isLoading || isFetching) && allItems.length === 0 && !searchQuery && activeFilterCount === 0 && smartView === 'all';
   ```
   This prevents the skeleton from appearing when the user is actively searching/filtering and results happen to be empty during a fetch.

These two changes ensure the search input stays mounted and focused at all times, and shimmer/skeleton only appears on the true initial page load (no query, no filters, no data yet).
