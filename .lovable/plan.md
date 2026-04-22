

## Freestyle Scene Catalog — small fixes

Four targeted tweaks. UI only. No DB or generation changes.

### 1. Fix double "X" close button

`SheetContent` (Radix) already renders a built-in close button in the top-right. `SceneCatalogModal` adds a second `<X>` in its custom header → two X's stacked.

Fix: remove the custom `<button>` with `<X />` from the modal header. Keep the title/subtitle. The Radix-supplied close stays (already accessible, already wired to `onOpenChange`).

### 2. Tighten vertical spacing between rails

Current: `space-y-6` between rails + `space-y-2.5` inside each rail + `pb-2` on the scroll row → on a 1328×818 viewport rails feel airy and only ~1.5 rails fit per screen.

Fix:
- `SceneCatalogModal` body wrapper: `space-y-6` → `space-y-4`, `py-5` → `py-4`.
- `SceneCatalogRail`: `space-y-2.5` → `space-y-2`, scroll row `pb-2` → `pb-1`.
- Rail heading: keep size, just less margin.

Net: ~30% tighter vertical rhythm, matches the rest of the app's density.

### 3. Add horizontal scroll arrows to rails (desktop)

Today rails rely on trackpad/scrollbar only. Add discoverable left/right chevron buttons that appear on `md:` and up, overlaid on the rail edges.

Implementation in `SceneCatalogRail`:
- Wrap the scroll row in a `relative` container.
- Attach a `ref` to the scroll row; track `canScrollLeft` / `canScrollRight` via a scroll listener + ResizeObserver.
- Render two absolutely-positioned circular buttons (`hidden md:flex`, 32px, white bg, soft shadow, `ChevronLeft` / `ChevronRight` icons) at vertical centre of the cards.
- Click → scroll the row by `clientWidth * 0.85` smooth.
- Hide each button when its direction is exhausted (or when `scenes.length` fits in view).
- Add subtle gradient fades on the edges (`pointer-events-none`) so cards don't visually clip behind the arrows.

Behaviour unchanged on mobile (arrows hidden, native swipe).

### 4. Add "Load all" button + clarify Popular sort

**Load all** — appears at the bottom of the filtered grid view (only when `hasNextPage` is true and not already fetching).
- Sits next to the existing infinite-scroll trigger as a fallback for users who'd rather click than scroll.
- Click → loops `fetchNextPage()` until `hasNextPage` is false. Shows a small spinner + "Loading X of Y" caption while running. Disabled when complete.
- Lives in `SceneCatalogGrid` footer area; passed `onLoadAll` from `SceneCatalogModal`.
- Capped at 10 sequential page fetches per click (≈240 scenes) to protect against runaway requests on tiny accounts; shows "Load more" again if cap hit and more remain.

**Popular sort — current truth.** It does **nothing real today**: the `'popular'` value is accepted by the dropdown but `applyFilters` only branches on `'new'`; everything else falls through to `sort_order ASC` (admin-curated order). There is no usage tracking joined in.

Two options for fixing it — pick one:

- **A. Remove "Popular" from the dropdown** (fastest, honest). Dropdown becomes Recommended / Newest. Zero backend work.
- **B. Wire it to real usage data.** Aggregate `freestyle_generations` (and `product_image_generations` for `pis-` scenes) by `scene_id` over the last 90 days, count distinct users, expose via a SQL view + RPC (`get_scene_popularity()`). Sort the catalog by the resulting score. ~1 day of work; needs a DB migration (view + index).

Recommendation: **A now**, file B as a follow-up if/when scene analytics become a priority. The plan ships A; B stays out of scope unless you say otherwise.

---

### Files touched

- `src/components/app/freestyle/SceneCatalogModal.tsx` — drop custom X button; tighten body spacing; pass `onLoadAll` to grid.
- `src/components/app/freestyle/SceneCatalogRail.tsx` — desktop scroll arrows + edge fades; tighter spacing.
- `src/components/app/freestyle/SceneCatalogGrid.tsx` — render "Load all" button alongside the infinite-scroll sentinel; loading caption.
- `src/components/app/freestyle/SceneCatalogFilters.tsx` — remove "Popular" `<SelectItem>`; keep Recommended + Newest.
- `src/hooks/useSceneCatalog.ts` — drop `'popular'` from the `sort` union (typescript cleanup).

### Untouched

DB schema, RLS, edge functions, generation pipeline, sidebar, custom_scenes flow, card design, mobile layout.

### Validation

- Only one X visible in the modal header (Radix's built-in, top-right).
- Rails feel ~30% tighter vertically; 2 full rails visible above the fold at 1328×818.
- Hovering a rail on desktop shows left/right chevrons; clicking scrolls one card-width's worth (~85% viewport width); chevrons hide at row ends and when content fits.
- Filtered grid shows "Load all" next to the auto-load sentinel; clicking loads remaining pages until done.
- Sort dropdown lists only Recommended / Newest. No misleading "Popular" option.

