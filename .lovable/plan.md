

# Fix Metric Cards Style & Mobile Layout

## Changes

### 1. `src/components/app/MetricCard.tsx` — Improve action card styling
- For action cards (with `description` + `action`): make the description text slightly larger (`text-sm font-medium text-foreground` instead of `text-sm text-muted-foreground`) so the workflow name stands out
- Make the action button more prominent: use `variant="outline"` styling with `rounded-full` and smaller padding
- Add a subtle left accent border on action cards for visual distinction

### 2. `src/pages/Dashboard.tsx` — Hide 5th card on mobile
- Change the grid from `grid-cols-2 md:grid-cols-3 lg:grid-cols-5` to `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`
- Add `hidden sm:block` (or `hidden md:block`) to the 5th card (Top Style) wrapper so it's hidden on mobile, showing a clean 2×2 grid
- Wrap the 5th MetricCard in a div with `className="hidden md:block"` to hide it on small screens

### Files
- `src/components/app/MetricCard.tsx` — improve action card description + button styling
- `src/pages/Dashboard.tsx` — hide 5th card on mobile

