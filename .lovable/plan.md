

# Fix Library Filter Controls Mobile Layout

## Problem
On mobile, the filter row (filter icon, grid columns selector, Select button) below the search bar appears cut off on the left side — the controls are not properly contained within the page padding.

## Root Cause
The controls wrapper (`div.flex.items-center.gap-2` at line 424) wraps below the full-width search bar on mobile. The parent uses `flex-wrap` with `justify-between`, which can cause the second row of wrapped items to sit at the start without proper alignment, and the filter popover's `relative` positioning may cause overflow.

## Changes

### File: `src/pages/Jobs.tsx` (lines 412, 424)

1. **Make the controls row full-width on mobile** so it doesn't get clipped. Add `w-full sm:w-auto` to the controls container (line 424) so it stretches across on mobile and aligns naturally.

2. **Adjust justify** on the controls row: add `justify-between sm:justify-end` so on mobile the filter icon and Select button spread evenly across the full width.

```tsx
// Line 424 — Before:
<div className="flex items-center gap-2">

// After:
<div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
```

This ensures the filter controls span the full width on mobile with even spacing, and collapse back to auto-width right-aligned on desktop.

### Files
- `src/pages/Jobs.tsx` — 1 class change on line 424

