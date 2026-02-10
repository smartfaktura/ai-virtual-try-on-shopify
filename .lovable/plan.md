

## Library Cleanup: Remove Filters, Fix Loading, Ensure True Masonry

### 1. Remove Source Filters (All / Generations / Freestyle)

Remove the source filter pills from the Library header. This simplifies the UI -- all images show together. Keep only Search, Newest/Oldest sort, and Select.

**File: `src/pages/Jobs.tsx`**
- Remove the `SOURCE_FILTERS` constant and `sourceFilter` state
- Remove the filter pill buttons and the divider from the toolbar
- Pass `'all'` directly to `useLibraryItems`

**File: `src/hooks/useLibraryItems.ts`**
- Clean up: remove the `sourceFilter` parameter, always fetch both sources
- Remove the `LibrarySourceFilter` type export

### 2. Fix Loading Lag During Generation

Currently the Library query only runs once and doesn't auto-refresh. When the user generates images and switches to Library, they see stale data until a manual refresh. We will:

**File: `src/hooks/useLibraryItems.ts`**
- Add `refetchInterval: 10000` (10 seconds) to the query options so new images appear automatically
- Add `refetchOnWindowFocus: true` so switching tabs triggers a refresh

### 3. Ensure True Masonry Layout

The masonry layout is already implemented with flex columns and `gap-1`, which is the same approach used on the Discover page. Images render at their natural aspect ratio (`w-full h-auto`). The shimmer placeholder currently uses `getAspectClass` to approximate the aspect ratio during loading -- this is correct and prevents layout shift.

No changes needed for the masonry layout itself -- it is already working. The images in the screenshot appear uniform because those particular generations happen to share similar aspect ratios.

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Jobs.tsx` | Remove source filter pills and state; remove divider |
| `src/hooks/useLibraryItems.ts` | Remove `sourceFilter` param and type; add `refetchInterval` and `refetchOnWindowFocus` |
