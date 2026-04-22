

## Fix Scenes modal mobile UX

The modal was built desktop-first. On mobile the sidebar is hidden entirely (so families/Recommended/New are unreachable), the filter bar overflows so the sort dropdown disappears off-screen, and the sheet uses `100vh` which gets cut by browser chrome.

### 1. Mobile filter bar — wrap + show all controls

`SceneCatalogFiltersBar.tsx`:
- Change root from single-row `flex items-center gap-2` to a two-row layout on mobile: row 1 = search (full width) + a new **Filters** button (opens the family/quick-view drawer, see step 2) + sort, row 2 = chip strip (horizontal scroll). On `sm:` and up, revert to today's single-row layout.
- Drop `max-w-[280px]` on search; on mobile use `flex-1`. On desktop cap at 280.
- Always render the **Filters** button on mobile (`lg:hidden`) so families are reachable; remove the `showMobileFiltersBtn` prop gating from `SceneCatalogModal` (always pass true effectively, but the button itself is `lg:hidden`).
- Sort `<Select>` keeps `w-[110px]` on mobile to fit; `w-[140px]` from `sm` up.

### 2. Mobile families drawer — make sidebar reachable

`SceneCatalogModal.tsx`:
- Add `mobileFiltersOpen` state.
- When the user taps the new **Filters** button in the bar, open a left-side `Sheet` (nested) that renders the existing `<SceneCatalogSidebar>` content. Reuse the same component — wrap it in a small adapter that drops the `hidden lg:block` class on mobile and gives it `w-full h-full`.
- Selecting a family / sub-family / quick view auto-closes the drawer (call existing handlers + `setMobileFiltersOpen(false)`).
- The original aside in the body keeps `hidden lg:block`; on mobile the body is grid-only.

### 3. Sheet sizing + safe areas

`SceneCatalogModal.tsx`:
- Replace `h-[100vh]` with `h-[100dvh]` so dynamic viewport (excluding browser chrome) is respected.
- Header: add a small close `X` button on the right on mobile (Radix `SheetContent` renders one by default — verify it's positioned and not clipped; if hidden by our padding, give the header `pr-12` on mobile so the title doesn't run under the X).
- Footer: on mobile add `pb-[max(0.75rem,env(safe-area-inset-bottom))]` so iOS home-indicator doesn't cover Use scene.
- Footer buttons stay side-by-side but if `footerTitle` truncates fine; reduce gap on mobile and shorten Cancel to an icon-less compact button (size unchanged, just ensure `truncate` on title works because the right cluster is `shrink-0`).

### 4. Grid density on mobile

`SceneCatalogGrid.tsx` (verify): cards should be 2 columns at `< 640px`, 3 at `sm`, 4 at `lg`. If today it forces 3+ on mobile, override with `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`. Adjust `containIntrinsicSize` accordingly so off-screen reservation matches new card height.

### Files touched

- `src/components/app/freestyle/SceneCatalogFilters.tsx` — two-row mobile layout, always-rendered Filters button on `lg:hidden`, narrower sort on mobile.
- `src/components/app/freestyle/SceneCatalogModal.tsx` — add mobile drawer with the sidebar; `h-[100dvh]`; safe-area footer padding; pass `onOpenMobileFilters` + `showMobileFiltersBtn`.
- `src/components/app/freestyle/SceneCatalogGrid.tsx` — confirm/fix `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` on mobile.
- `src/components/app/freestyle/SceneCatalogSidebar.tsx` — accept an optional `mobileMode` prop that strips `hidden lg:block` and the fixed `w-60` so it can fill the mobile drawer; auto-close on selection via callback prop `onAfterSelect?`.

### Untouched

DB, RLS, sort_order star logic, `useSceneCatalog`/`useInterleavedSceneCatalog`, recommended rail, generation pipeline, desktop layout (visually identical at `lg` and up).

### Validation (375 × 812)

- Open `/app/freestyle` → tap Scene chip → modal opens at full dynamic-viewport height; nothing under the iOS home indicator.
- Header shows title + close X, both visible.
- Filter bar row 1: search fills width, **Filters** button + sort dropdown both visible (no horizontal overflow).
- Filter bar row 2: Product Only / With Model chips scroll horizontally; sort isn't pushed off-screen.
- Tap **Filters** → left drawer slides in showing All scenes / Recommended / New + every Product Family. Tap **Beauty** → drawer closes, grid shows Beauty scenes.
- Grid renders 2 columns; thumbs aren't squished.
- Footer: Cancel + Use scene fit on one row; selected thumb + title truncates.
- Switching family resets scroll to top (existing effect).
- Desktop ≥ 1024px: layout unchanged from today.

