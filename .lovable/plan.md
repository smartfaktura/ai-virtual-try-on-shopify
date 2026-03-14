

## Fix: Library Page Flash/Refresh When Navigating from Dashboard "View" Button

### Root Cause

When clicking "View" on a completed job in the Dashboard, the app navigates to `/app/library?search=ProductName`. The Library page (`Jobs.tsx`) mounts fresh, and several things cause the flash:

1. **No `placeholderData`** on `useLibraryItems` — the infinite query starts from scratch with `isLoading: true`, showing a loading skeleton, then quickly switches to results. This creates the "flash" effect.
2. **`refetchOnWindowFocus: true`** can trigger a second fetch if the navigation causes a focus event.
3. The query key `['library', sortBy, searchQuery, userId]` includes `searchQuery`, so it's always a cache miss on first visit with a search term.

### Fix (2 changes in `src/hooks/useLibraryItems.ts`)

1. **Add `placeholderData: keepPreviousData`** to the infinite query options — this keeps old data visible during refetches instead of flashing to empty/loading state.
2. **Remove `refetchOnWindowFocus: true`** (or set to `false`) — the `staleTime: 60_000` already prevents unnecessary refetches, and `refetchOnWindowFocus` causes a redundant fetch on navigation that contributes to the flash.

### Changes

**`src/hooks/useLibraryItems.ts`**
- Import `keepPreviousData` from `@tanstack/react-query`
- Add `placeholderData: keepPreviousData` to the query config
- Change `refetchOnWindowFocus: true` → `refetchOnWindowFocus: false`

Single file, ~3 lines changed.

