

## Tighten Scenes modal mobile UI

Trim the mobile filter bar down to just what's needed and make the footer actions easier to tap.

### 1. Filter bar (`SceneCatalogFilters.tsx`)

On mobile (`<lg`):
- **Remove** the search input entirely (kept on desktop). `Search` icon import goes if unused.
- **Remove** the Product Only / With Model chips on mobile (`hidden lg:flex` on the chip strip). They're still reachable via the Filters drawer if needed; on desktop they remain.
- The mobile row becomes a single, balanced row: `[Filters]  [Sort dropdown]`, both pill-shaped, same height (`h-9`), same rounded-full style, equal flex sizing so they share width 50/50 and the "Recommended" label fits without truncation.
  - `Filters` button: `flex-1 h-9 rounded-full`
  - Sort `SelectTrigger`: `flex-1 h-9 rounded-full` (remove fixed `w-[110px]`); add `truncate` on the value so longer labels behave.
- Desktop layout (≥`lg`) is untouched.

### 2. Header copy (`SceneCatalogModal.tsx`)

Replace the subtitle:
- From: `Find the right shot for your product — 1,200+ curated scenes.`
- To: `1,200+ curated scenes`

(No trailing period — matches the project's minimalist header rule.)

### 3. Footer buttons (`SceneCatalogModal.tsx`)

Make Cancel / Use scene larger and more thumb-friendly on mobile:
- Both buttons go from `size="sm"` → `size="default"` (h-10, full pill style from the design system).
- Slightly increase footer vertical padding from `py-3` to `py-3.5` so the taller buttons breathe.
- Selected-scene title block stays truncated; thumb stays 10×10.

### Files touched

- `src/components/app/freestyle/SceneCatalogFilters.tsx` — hide search + chips on mobile, equal-width Filters/Sort row, taller pills, drop unused `Search` import if no longer needed (keep it for desktop search).
- `src/components/app/freestyle/SceneCatalogModal.tsx` — shorter subtitle, larger footer buttons.

### Untouched

Desktop layout, sidebar drawer, grid, sort_order/star logic, hooks, RLS, generation pipeline.

### Validation (390 × 818)

- Modal opens; header reads "Select Scene" + small "1,200+ curated scenes" subtitle.
- Filter bar: only two pills visible — `Filters` and `Recommended` — same height, equal width, no truncation, no search field, no Product Only / With Model chips.
- Footer buttons (Cancel, Use scene) are noticeably larger and easier to tap; both fit on one line.
- Desktop ≥ 1024px: search input, chips, and sort all visible exactly as today.

