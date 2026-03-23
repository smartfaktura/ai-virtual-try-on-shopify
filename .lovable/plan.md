

# Dashboard Branding Consistency Fixes

## Changes Overview
1. Category bar: user's preferred category shows first (before "All")
2. Rename "Recreate What Works" → "Steal This Look"
3. Standardize all section headings to `text-xl sm:text-2xl font-bold tracking-tight` with optional subtitle in `text-sm text-muted-foreground`
4. Wrap "Recent Jobs" table inside a section with matching heading outside the card
5. Wrap "Recent Activity" and "Upcoming Drops" with matching heading style
6. Standardize all card/table containers to `rounded-2xl`

## File Changes

### 1. `src/components/app/DashboardDiscoverSection.tsx`

- Rename title: "Recreate What Works" → "Steal This Look"
- **Fix category order**: Move preferred category to index 0 (before "All"), not after it:
  ```tsx
  return [preferred, CATEGORIES[0], ...rest]; // Beauty, All, Fashion, ...
  ```

### 2. `src/components/app/RecentCreationsGallery.tsx` (lines 189-195)

- Change heading from `text-xl` → `text-xl sm:text-2xl font-bold tracking-tight`
- Already has subtitle — good

### 3. `src/components/app/DashboardTeamCarousel.tsx` (line 7)

- Change heading from `text-xl font-bold` → `text-xl sm:text-2xl font-bold tracking-tight`

### 4. `src/pages/Dashboard.tsx` — Returning user (lines 533-632)

**Recent Jobs section**: Extract the heading outside the card container so it matches the pattern of other sections:
```tsx
<div className="space-y-4">
  <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Recent Jobs</h2>
  <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
    <div className="p-5">
      {/* table content, no inner heading */}
    </div>
  </div>
</div>
```

Also update the "Create" section heading (line 494) from `text-xl` → `text-xl sm:text-2xl font-bold tracking-tight`.

### 5. `src/components/app/ActivityFeed.tsx` (lines 142-168)

- Change heading from `text-xl font-bold` → `text-xl sm:text-2xl font-bold tracking-tight`
- The card already uses `rounded-2xl` — good

### 6. `src/components/app/UpcomingDropsCard.tsx` (lines 59-175)

- Extract heading outside the `<Card>` into a wrapper `div.space-y-4` with standardized heading
- Change from `text-base font-semibold` → `text-xl sm:text-2xl font-bold tracking-tight`
- Ensure `<Card>` uses `rounded-2xl` (check Card component default)

### Files
- `src/components/app/DashboardDiscoverSection.tsx` — rename + fix category order
- `src/components/app/RecentCreationsGallery.tsx` — heading size
- `src/components/app/DashboardTeamCarousel.tsx` — heading size
- `src/pages/Dashboard.tsx` — Recent Jobs heading extraction, Create heading size
- `src/components/app/ActivityFeed.tsx` — heading size
- `src/components/app/UpcomingDropsCard.tsx` — heading extraction + size

