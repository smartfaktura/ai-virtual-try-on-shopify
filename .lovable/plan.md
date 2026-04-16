

# Replace Smart Views Slider with Better Mobile Layout

## Problem
The Library page Smart Views bar (All, Favorites, Brand Ready, Ready to Publish) renders as a horizontal scroll on mobile, producing an ugly visible scrollbar/track below the pills. On mobile there are only 4 items — they should fit without scrolling if styled properly.

## Fix

### File: `src/pages/Jobs.tsx` (lines 374-390)

Add `scrollbar-hide` class to the container and reduce gap/padding on mobile so all 4 pills fit in one row without overflow:

```tsx
// Before
<div className="flex items-center gap-1.5 overflow-x-auto">

// After
<div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-hide">
```

Also tighten the pill padding on mobile to ensure all 4 fit:
```tsx
// Before
'px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium ...'

// After  
'px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium ...'
```

This hides the scrollbar track (using the existing `scrollbar-hide` utility already used elsewhere in the app) and tightens horizontal spacing so the 4 pills fit on most mobile screens without scrolling.

### Files
- `src/pages/Jobs.tsx` — 2 small class changes on the Smart Views section

