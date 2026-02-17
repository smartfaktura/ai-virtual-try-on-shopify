

## Restore Desktop Top Gap in Freestyle

### Problem

The recent mobile fixes changed the desktop scroll area padding to `lg:pt-0`, removing all top spacing. Images now start flush at the very top of the content area on desktop, with no breathing room matching the sidebar header.

### Fix

**File: `src/pages/Freestyle.tsx` (line 535)**

Change `lg:pt-0` to `lg:pt-1` on the scrollable container. This restores a 4px top gap on desktop that visually aligns the first row of images with the top of the sidebar content area, matching the grid's internal `gap-1` spacing.

```
// Before
<div className="h-full overflow-y-auto pt-[5rem] lg:pt-0 pb-72">

// After
<div className="h-full overflow-y-auto pt-[5rem] lg:pt-1 pb-72">
```

This is a single-line change. Mobile layout remains unaffected.

