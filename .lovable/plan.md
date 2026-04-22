

## Fix Scenes modal lag + scroll-position memory

Two small, focused fixes — no new features.

### 1. Stop dumping 1,236 cards into the DOM at once

Today `useInterleavedSceneCatalog` returns every active scene in one page and `SceneCatalogGrid` flattens them all and renders simultaneously. Each card mounts a `ShimmerImage` (state + IntersectionObserver), so we mount 1k+ observers on open → that's the "laggy" feeling.

Fix: paginate the interleaved view client-side and reuse the same infinite-scroll machinery the filtered view already uses.

In `src/hooks/useSceneCatalog.ts` → `useInterleavedSceneCatalog`:
- Keep the one-shot fetch + family-grouped ordering (it's fast — single SELECT, cached 10 min).
- Instead of returning `{ pages: [finalList] }`, slice `finalList` into chunks of `PAGE_SIZE` (24) and return `{ pages: chunks }` plus a `pageParam`-shaped object so the consumer treats it like an infinite query.
- Easier alternative (chosen): keep `useQuery` but expose two values in `SceneCatalogModal`: the full ordered array + a `visiblePageCount` state that grows on sentinel intersection. Pass `pages = orderedList.slice(0, visiblePageCount * 24)` as a single page array to `SceneCatalogGrid`, with a synthetic `hasNextPage = orderedList.length > visiblePageCount * 24` and an `onLoadMore` that bumps `visiblePageCount`.

This way the initial render is 24 cards, scrolling reveals the rest 24 at a time, and the auto-`Load more` sentinel already in `SceneCatalogGrid` does the work — no new infra.

Initial mount drops from ~1236 cards to 24 → no more lag. Same total content available; just streamed in.

### 2. Reset scroll to top when the user switches section / family / sub-family

In `SceneCatalogModal.tsx`:
- Wrap the `<ScrollArea>` with a ref to its viewport (Radix `ScrollArea` exposes the viewport via `data-radix-scroll-area-viewport`). Get it via a small ref callback.
- Add a `useEffect` that calls `viewport.scrollTo({ top: 0 })` whenever any of these change: `quickView`, `family`, `categoryCollection`, `subjects`, `debouncedSearch`, `sort`. Reset the visible-page-count back to 1 in the same effect so the new section opens with 24 fresh cards (not whatever count you'd scrolled to).

Same effect also resets the per-section `visiblePageCount` so switching to "Beauty" doesn't render hundreds of cards immediately.

### 3. Tiny win: lazy-render with `content-visibility`

Add `style={{ contentVisibility: 'auto', containIntrinsicSize: '320px' }}` on each `SceneCatalogCard` wrapper button. Browsers skip layout/paint of off-screen cards. Cheap and safe — covers any remaining jank if a user scrolls fast through the paginated list.

### Files touched

- `src/components/app/freestyle/SceneCatalogModal.tsx` — add `viewport` ref + scroll-reset effect; replace the `interleavedGrid.data?.pages ?? []` prop with the sliced view; add `visiblePageCount` state; reset on filter change.
- `src/components/app/freestyle/SceneCatalogCard.tsx` — add `content-visibility` style on the root `<button>`.
- `src/hooks/useSceneCatalog.ts` — no signature change needed; we keep `useInterleavedSceneCatalog` returning the full ordered list and do the slicing in the modal (simpler, less churn).

### Untouched

DB, RLS, sort_order star logic, admin page, filter sidebar, `useSceneCatalog` paged query, recommended rail, generation pipeline.

### Validation

- Open Scenes modal → first paint shows 24 cards instantly; no jank, no long freeze.
- Scroll down → next 24 stream in via the existing sentinel loader, repeat until end.
- Click sidebar **Beauty** while scrolled halfway down → grid jumps to top of Beauty view (not the middle of the previous list).
- Click **All scenes** again → scroll resets to top of the full interleaved list.
- Switching sort to **Newest** also resets scroll + page count.
- Console no longer warns about ref forwarding (already fixed previously) and no new warnings.

