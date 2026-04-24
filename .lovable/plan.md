

## Safety review: is the masonry stabilization plan safe?

Yes — the plan is performance-first and does not change any behavior that the modal, recreate flow, save, admin tools, or routing depend on. Here's the audit.

### What the plan touches vs. what it leaves alone

| Area | Touched? | Risk |
|---|---|---|
| `DiscoverCard` masonry image wrapper (add `aspect-ratio` div) | Yes — visual only | None. Same DOM tree as the existing `aspectRatioOverride` branch already used by Dashboard. |
| Loading skeleton in `Discover.tsx` / `PublicDiscover.tsx` | Yes — replace centered loader with ratio-aware masonry skeleton | None. Skeleton is pre-data UI; never renders alongside cards. |
| Progressive render (`visibleCount` + sentinel) in `Discover.tsx` | Yes — already exists in PublicDiscover, mirror it | None. Items append; existing tiles never move. |
| `DashboardDiscoverSection` eager count 8 → 4 | Yes — one-line | None. Below-the-fold tiles still load lazily. |
| New helper `src/lib/discoverAspect.ts` | New file | None. Pure function. |
| Modal open / detail view / `DiscoverDetail` route | **Not touched** | Card `onClick` handler unchanged. |
| Recreate flow, save, admin pin/feature, hide scene | **Not touched** | All handlers and props pass through. |
| `useDiscoverPresets`, `useRecommendedDiscoverItems`, `useFeaturedItems`, `useSavedItems`, `useHiddenScenes` | **Not touched** | Same data, same shape, same cache keys. |
| Stable column assignment (`i % columnCount`) | **Not touched** | Order preserved across appends. |
| URL slug routing, deep links | **Not touched** | |
| DB / RLS / taxonomy / categories | **Not touched** | |

### Why the modal cannot break

`DiscoverCard`'s `onClick={onClick}` and the `onRecreate` / `onToggleSave` / `onToggleFeatured` handlers stay exactly as today. The only change inside the card is wrapping `<ShimmerImage>` in a `<div style={{ aspectRatio }}>` — which is the same wrapper pattern already used when `aspectRatioOverride` is provided (Dashboard uses it in production right now). Click events bubble identically.

### Why progressive render cannot hide items

- `visibleCount` starts at 24 and only ever **increases** via the IntersectionObserver sentinel.
- It resets to 24 only when `selectedCategory` / `selectedSubcategory` / `similarTo` change — i.e. an actual user filter change, identical to PublicDiscover today.
- Filtering, sorting, dedup, recommended-merge logic all run before slicing, so no item is ever excluded — only deferred.

### Why aspect-ratio reservation cannot crash a card

- Presets always have `aspect_ratio` populated in the DB (`"3:4"`, `"4:5"`, `"1:1"`, etc.).
- The helper `getDiscoverItemAspectRatio` falls back to `"4 / 5"` if the value is missing or malformed, so a bad row still renders a valid box.
- If the image fails to load, `ShimmerImage` already handles `onError` and the reserved box just stays empty — same as today, minus the jumping.

### Performance wins (not just stability)

- First paint shows masonry-shaped skeleton with same vertical rhythm — no "snap" when data arrives.
- Only 24 cards render initially → fewer image requests, faster TTI.
- Dashboard drops from 8 eager fetches to 4 → less bandwidth contention on the LCP.
- React-query cache (`staleTime: 10min`) already in place → tab switches stay instant.

### Files (final, unchanged from prior plan)

```text
src/lib/discoverAspect.ts                         (new, ~30 lines)
src/components/app/DiscoverCard.tsx               wrap masonry image in aspect-ratio box
src/pages/Discover.tsx                            ratio-aware skeleton + progressive render
src/pages/PublicDiscover.tsx                      ratio-aware skeleton (rest already correct)
src/components/app/DashboardDiscoverSection.tsx   eager 8 → 4
```

### Out of scope (explicitly)
- No modal / detail / lightbox changes.
- No data hook changes.
- No DB / RLS / taxonomy changes.
- No new dependencies.

### Verdict
Safe. Performance-first. Modal opening, recreate, save, admin tools, routing, and data flow all remain byte-identical. The only observable changes are: skeleton looks like the grid, tiles reserve their box before images load, and Discover loads in batches of 24 like PublicDiscover already does.

