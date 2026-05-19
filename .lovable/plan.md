# Fix: Library search loading indicator placement

## Problem
On `/app/jobs` (Library), while a search query is fetching, a `Loader2` spinner is rendered absolutely positioned at `top-[40vh]` over the results grid (Jobs.tsx lines 599–606). On mobile and desktop this looks like a random spinner floating in the middle of the screen, disconnected from the search input the user just typed in.

## Fix
Show the loading state **inside the search input** (right side), where the user's attention already is. Remove the floating overlay spinner during search.

### Changes — `src/pages/Jobs.tsx`

1. **Search input area (around line 441–450):** Add a right-aligned `DotPulse` (or small `Loader2`) inside the input, visible only when `isFetching && searchQuery` (i.e. actively searching, not initial page load). Add `pr-10` padding when visible to avoid text overlap. Also show a small "Clear" (×) button when `searchQuery` is set and not fetching, so users can quickly reset.

2. **Remove overlay spinner (lines 599–606):** Delete the absolute/sticky `Loader2` overlay block. Keep the results grid clean — the inline indicator in the search bar already communicates fetching state. Pagination's "Load More" spinner (line 649) stays unchanged.

3. **Use `DotPulse`** (`src/components/ui/dot-pulse.tsx`) for the inline indicator — matches the project's existing minimal loading aesthetic. Size `sm`, colored `text-muted-foreground`.

### Why safe
- Pure presentational change inside `Jobs.tsx`. No data, hook, or query changes.
- `isFetching` / `isLoading` semantics from `useLibraryItems` unchanged.
- Initial-load skeleton (`isInitialLoading` branch) and empty-state handling unchanged.
- Mobile and desktop both benefit — the indicator anchors to the input, which is at the top of the viewport on both.

### Out of scope
- Search debouncing, results behavior, hook logic — already addressed in prior turns.
- Filter chips, sort, column controls.
