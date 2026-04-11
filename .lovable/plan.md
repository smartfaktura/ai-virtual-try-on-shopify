

# Create "History" Page

## Summary
Add a new `/app/history` page that combines all creation history (workflow generations + freestyle generations) into a single, full-page gallery view with the Dashboard's design language (team avatars, activity feed style). Add it to the sidebar right after "Library".

## What the user will see
- A new "History" nav item in the sidebar, right after Library
- A dedicated page at `/app/history` with two sections:
  1. **Workflow Creations** — full list of all completed workflow generation jobs (same data as the "Recent Creations" strip on `/app/workflows`, but showing ALL results in a paginated gallery grid with image lightbox)
  2. **Freestyle Generations** — full gallery of all freestyle images, with the same card style, view overlay, and `LibraryDetailModal` integration
- Dashboard-matching design: team avatars next to entries, section labels, same card aspect ratios, activity metadata (workflow name, date, prompt preview)
- Clickable images open the existing `LibraryDetailModal` for full detail view

## Technical changes

### 1. New file: `src/pages/History.tsx`
- Query `generation_jobs` (completed, with workflow join) — no limit (or high limit like 200) instead of the current 50
- Query `freestyle_generations` — same high limit
- Sign URLs via `toSignedUrls`
- Two tab-like sections or vertically stacked sections: "Workflow Creations" and "Freestyle Creations"
- Reuse existing components: `PageHeader`, `ShimmerImage`, `LibraryDetailModal`, `Badge`, `Skeleton`
- Team avatar assignment per item (reuse the `getTeamAvatar` pattern from `ActivityFeed.tsx`)
- Each image card: 3:4 aspect ratio, hover overlay with Eye icon + "View", click opens `LibraryDetailModal`
- Empty states using `EmptyStateCard`
- Pagination: "Load More" button or infinite scroll for large libraries

### 2. `src/App.tsx`
- Add lazy import: `const History = lazy(() => import('@/pages/History'));`
- Add route: `<Route path="/history" element={<History />} />`

### 3. `src/components/app/AppShell.tsx`
- Add nav item after Library (line 58): `{ label: 'History', icon: Clock, path: '/app/history' }`
- Import `Clock` from lucide-react

Three files total: one new page, two small edits.

