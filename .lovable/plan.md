

## Fix All Creative Drops UI Issues

### Overview

A comprehensive pass across the Creative Drops page, wizard, and supporting components to address mobile usability, missing loading states, scroll conflicts, and general polish.

---

### Changes by File

#### 1. `src/components/app/CreativeDropWizard.tsx`

**A. Sticky credit calculator causes scroll conflict on mobile (Step 3, line 1026)**

The `sticky bottom-0` calculator with `-mx-1` negative margins intercepts touch events and creates a scroll boundary conflict on iOS. Fix: remove `sticky` on mobile, keep it on desktop only.

```
// Before
<div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border pt-3 pb-1 -mx-1 px-1 z-10">

// After
<div className="bg-background/95 sm:sticky sm:bottom-0 backdrop-blur-sm border-t border-border pt-3 pb-1 z-10">
```

Remove the `-mx-1 px-1` negative margin hack entirely -- it causes clipping on narrow screens.

**B. Product grid needs max-height on mobile (Step 2, line 594)**

Currently `sm:max-h-[320px] sm:overflow-y-auto` only kicks in at 640px+, so on phones the grid is unbounded and makes the page very long.

```
// Before
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:max-h-[320px] sm:overflow-y-auto pr-1">

// After
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto overscroll-contain pr-1">
```

Using `max-h-[50vh]` ensures it works on all screen sizes and the user can always see the footer buttons. Adding `overscroll-contain` prevents scroll chaining within the grid.

**C. Scene and pose grids also need mobile max-height (lines 785, 856, 930)**

Same pattern -- these grids only have `sm:max-h-[200px]` which means they're unbounded on mobile.

```
// Before (3 locations)
sm:max-h-[200px] sm:overflow-y-auto

// After
max-h-[40vh] sm:max-h-[200px] overflow-y-auto overscroll-contain
```

**D. Add step label tooltips on mobile (line 457)**

Step labels are `hidden sm:inline` with no fallback. Add a `title` attribute so mobile users can long-press to see the label, and also add `aria-label` for accessibility.

```
// Before
<span className="hidden sm:inline">{s}</span>

// After  
<span className="hidden sm:inline">{s}</span>
// Also add title={s} and aria-label={`Step ${i+1}: ${s}`} to the parent button
```

**E. Loading states for data queries**

The wizard shows no loading indication while brand profiles, products, and workflows are fetching. Add simple loading skeletons:

- Step 1: Show skeleton for brand profile selector while loading
- Step 2: Show skeleton grid while products are loading
- Step 3: Show skeleton list while workflows are loading

Use the existing `isLoading` states from the `useQuery` hooks (add destructuring for `isLoading` on the existing queries at lines 166, 175, 184).

**F. Image error fallbacks**

Product images and workflow preview images can fail to load. Add `onError` handlers to `<img>` tags in the product grid (line 618) and review step (line 1326) that set a placeholder:

```tsx
onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
```

---

#### 2. `src/pages/CreativeDrops.tsx`

**G. Calendar touch targets too small on mobile (line 540)**

The 7-column grid creates cells that are roughly 40px on a 320px phone. Add minimum sizing:

```
// Before
<div className="grid grid-cols-7 gap-1 text-center">

// After
<div className="grid grid-cols-7 gap-1 text-center min-w-0">
```

And on each cell (line 554), increase the minimum tap target:

```
// Before
'aspect-square flex flex-col items-center justify-center rounded-lg text-sm'

// After
'aspect-square flex flex-col items-center justify-center rounded-lg text-sm min-h-[40px]'
```

**H. Filter bar scroll indicator (line 313)**

The `scrollbar-hide` on the filter buttons removes all indication that more filters exist. Add a subtle gradient fade on the right edge and keep `scrollbar-hide`:

```
// Before
<div className="flex gap-1.5 overflow-x-auto scrollbar-hide">

// After
<div className="flex gap-1.5 overflow-x-auto scrollbar-hide relative">
```

Wrap in a container with a right-edge gradient mask using CSS:

```
<div className="relative flex-1 overflow-hidden">
  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pr-4">
    ...buttons...
  </div>
  <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
</div>
```

**I. Onboarding image error fallback (line 458)**

Add `onError` handler to preview images in the onboarding section.

---

#### 3. `src/components/app/PageHeader.tsx`

**J. Mobile back button + title stacking gap (line 15)**

The gap between back button and title on mobile is only `gap-1` which looks cramped.

```
// Before
<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">

// After
<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
```

---

### Summary

- 3 files modified
- No new dependencies
- Fixes: sticky credit bar scroll conflict, unbounded grids on mobile, missing loading states, missing image fallbacks, small calendar tap targets, cramped PageHeader, missing scroll indicators
- All changes are mobile-first improvements that preserve existing desktop behavior

