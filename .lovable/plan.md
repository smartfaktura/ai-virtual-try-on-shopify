## Goal

Two fixes on `/product-visual-library`:

1. **Mobile experience** — currently it stacks two horizontal pill rails (top-level categories from `LibrarySidebarNav` + sub-collection pills inside `FamilySection`), which is cramped, looks misaligned, and forces horizontal scrolling on every level. Replace this with the same drawer-based pattern used in the in-app Freestyle Scene Catalog (`src/components/app/freestyle/SceneCatalogModal.tsx` + `SceneCatalogSidebar.tsx`): a single "Filters" button on mobile that opens a left Sheet containing the full Categories list with expandable sub-collections.

2. **Loading skeletons** — the page currently uses bespoke pulsing divs (`bg-foreground/[0.06]`, `bg-muted/40`). Replace with the shared `<Skeleton>` primitive from `src/components/ui/skeleton`, matching the in-app rhythm (e.g. `Skeleton className="aspect-[4/5] w-full rounded-xl"` for cards, `Skeleton h-9 rounded-full` for pills, `Skeleton h-10 rounded-xl` for sidebar rows).

## Mobile design (mirrors Freestyle scene catalog)

```text
┌──────────────────────────────────────────┐
│ AI Product Visual Library                │  hero (unchanged)
│ Browse 1,613+ visual directions...       │
├──────────────────────────────────────────┤
│ [⚙ Filters: Fashion · Creative Shots] [⨯]│  sticky bar — opens drawer
├──────────────────────────────────────────┤
│ Fashion · Creative Shots                 │  current selection eyebrow
│ ┌──┬──┬──┐                               │
│ │  │  │  │                               │  2-col scene grid
│ ├──┼──┼──┤                               │
└──────────────────────────────────────────┘

Drawer (Sheet, side="left", w-[85vw] max-w-[320px]):
  QUICK
    All categories            1,613
  CATEGORIES
    ▸ Fashion & Apparel        425
        ▾ (expanded when active)
          Creative Shots       210
          On-Model              80
          ...
    ▸ Footwear                 312
    ▸ Beauty                   ...
```

Desktop (≥lg) keeps the existing sticky left rail + horizontal sub-collection pills with arrows (no change there).

## Files to change

### `src/pages/ProductVisualLibrary.tsx`
- Add mobile state `mobileFiltersOpen` and a single sub-collection state lifted up so the drawer can drive both the family and the active sub-collection. Actually simpler: keep sub-collection state inside `FamilySection` but pass a callback from page → drawer that selects family + sub.
- On mobile (`<lg`), hide the existing in-grid sub-collection pills row; show instead a sticky "Filters" trigger bar above the grid with the current selection chip + clear (×) button.
- Render a `<Sheet side="left">` containing a single combined nav: top-level categories with their sub-collections nested under the active one (same visual as `SceneCatalogSidebar` `mobileMode`).
- Replace the bespoke loading block with `<Skeleton>`-based grid: 12 × `Skeleton aspect-[4/5] rounded-xl`, plus one row of pill `Skeleton h-9 w-24 rounded-full` placeholders for the trigger bar area.
- Reduce hero bottom padding spacing only if needed to keep current tight rhythm; otherwise leave hero untouched.

### `src/components/library/LibrarySidebarNav.tsx`
- Remove the mobile horizontal pill row entirely (the new drawer replaces it).
- Keep the desktop sticky aside as-is, but swap the bespoke skeleton bars for `<Skeleton className="h-10 w-full rounded-xl" />`.

### New `src/components/library/LibraryMobileFilters.tsx`
- Self-contained Sheet content rendering Quick ("All categories") + each `FamilyGroup` as an accordion row. Tapping a family with multiple `collections` expands inline; tapping a collection selects it and closes the drawer. Tapping a family with only one collection (or "All" within it) selects family + clears collection.
- Visual rhythm mirrors `SceneCatalogSidebar` (rounded pills, `bg-primary/10 text-primary` for active, count on right).

### `src/components/library/SceneCard.tsx`
- Replace the bespoke `SceneCardSkeleton` (`animate-pulse rounded-2xl bg-muted/40`) with `<Skeleton className="aspect-[3/4] w-full rounded-2xl" />` from `@/components/ui/skeleton`.

### `src/components/library/SceneDetailModal.tsx`
- Replace the manual `animate-pulse bg-foreground/[0.06]` overlay with `<Skeleton className="absolute inset-0" />` for the hero loading state. Keep the blurred placeholder `<img>` and `onLoad` fade behaviour as-is.

## Behavioural details

- The drawer's "active selection" chip in the trigger bar shows: `Family · SubCollection` (or `Family · All` when no sub picked, or just `All categories` initially).
- The clear (×) button on the trigger bar resets to the first family + null sub-collection (same as today's "All" pill behaviour).
- On family change from the drawer, the page scrolls to `#catalog-grid` (current behaviour preserved).
- Sub-collection pill row inside `FamilySection` stays for desktop only — wrap its `<div className="relative mb-8">` with `hidden lg:block`. Mobile users get the drawer instead.
- Infinite scroll, pagination (`PAGE_SIZE = 30`), and sentinel logic remain unchanged.

## Out of scope

- No data/query changes.
- No hero copy or CTA changes.
- Desktop layout unchanged apart from the skeleton primitive swap.
