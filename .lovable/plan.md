## /product-visual-library polish

### 1. Pills alignment + scroll arrows (`ProductVisualLibrary.tsx` `FamilySection`)

Current bug: pill row has `-mx-4 sm:-mx-6` so it bleeds outside the content column and starts to the LEFT of the image grid. Fix:

- Drop the negative margins; pills row sits flush in the same column as the grid (so "Clothing & Apparel" lines up exactly with the first image)
- Wrap the pill row in a relative container with a horizontally scrollable `<div ref={scrollRef}>`
- On `lg:` add two ghost arrow buttons (`ChevronLeft` / `ChevronRight`) absolutely positioned at the row's edges with white-to-transparent fade gradients. Click → `scrollRef.current.scrollBy({ left: ±240, behavior: 'smooth' })`
- Show/hide arrows based on `canScrollLeft` / `canScrollRight` state, updated on scroll + resize
- Hide arrows on mobile (touch swipe is natural)
- Keep `pb-2` for scrollbar room; keep webkit-scrollbar:hidden

### 2. Tighter hero → pills spacing (`ProductVisualLibrary.tsx`)

- Hero section: `py-10 sm:py-14` → `pt-10 sm:pt-14 pb-6 sm:pb-8`
- Catalog section: `py-10 sm:py-14` → `pt-2 sm:pt-4 pb-10 sm:pb-14`

This collapses the dead air between the H1 block and the first row of categories, while keeping the catalog's bottom padding intact.

### 3. Better loading skeletons

**Initial page load** (`ProductVisualLibrary.tsx`):
- Replace the bare `h-9 w-64 ... rounded-full` skeleton with a row of 6 pulsing pill skeletons (matching the actual pill row layout) + the existing card skeleton grid expanded to 15 cards (3 rows on desktop) for a richer first paint
- Sidebar already renders from data; add a graceful loading state for the sidebar nav too: 8 pulsing rows when `isLoading && families.length === 0`

**Family switch / pill switch**: `FamilySection` already shows skeletons via the lazy-load sentinel, but it briefly shows zero cards before first slice renders. Use a short transition: keep the previous content visible until the new family's first 30 cards have at least started loading (already mostly handled by React's render).

### 4. Modal image loading skeleton + optimization (`SceneDetailModal.tsx`)

Currently the modal renders an `<img>` and shows only a static placeholder icon while it loads. Improve:

- Track `imgLoaded` state via `onLoad` handler
- Show an animated `bg-muted/40 animate-pulse` skeleton overlay while `!imgLoaded`
- Image already uses `getOptimizedUrl(url, { quality: 75 })` — keep that, but add `srcSet` for retina (`?quality=75&width=...` is not used here per memory `image-optimization-no-crop` to avoid crop, so we keep quality-only). Already good.
- Reset `imgLoaded` when `scene.scene_id` changes (use `useEffect` keyed on scene id)
- Hide the static `ImageIcon` once loaded

Also: the modal currently has `overflow-hidden` AND `overflow-y-auto` on the same `DialogContent` — remove the redundant `overflow-hidden` to avoid clipping the scroll on tall content.

### Files
- `src/pages/ProductVisualLibrary.tsx` — hero/catalog padding, pills row alignment + arrows, richer loading skeletons, sidebar skeleton
- `src/components/library/SceneDetailModal.tsx` — image skeleton + load state
- `src/components/library/LibrarySidebarNav.tsx` — accept optional `isLoading` to render skeleton rows

No new dependencies. No data hook changes.
