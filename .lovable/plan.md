

# Fix Filter Dropdown Cut Off on Mobile

## Problem
The filter dropdown (Type/Sort popover) is positioned with `right-0`, meaning its right edge aligns with the filter button's right edge. On mobile, the filter button sits on the left side of the screen, so the 224px-wide dropdown extends to the LEFT — off-screen. This causes the dropdown to be clipped/hidden on the left side.

## Fix

### File: `src/pages/Jobs.tsx` (line 448)

Change the dropdown positioning from `right-0` to `left-0` on mobile so it opens to the right of the filter button (staying on-screen), and keep `right-0` on desktop:

```tsx
// Before
<div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl bg-popover border border-border shadow-xl p-4 space-y-4">

// After
<div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 z-50 w-56 rounded-2xl bg-popover border border-border shadow-xl p-4 space-y-4">
```

On mobile (`left-0`), the popup opens rightward from the filter button — fully visible. On `sm+` (`right-0 left-auto`), it stays right-aligned as before.

### Files
- `src/pages/Jobs.tsx` — 1 class change on line 448

