

# Hide Horizontal Scroll on Mobile/Tablet Stepper

## Problem
The stepper area near "Product / Shots / Setup / Generate" shows a horizontal scroll or "Carousel scroll" indicator on mobile and tablet viewports.

## Fix
**File: `src/components/app/catalog/CatalogStepper.tsx`**

Add `overflow-hidden` to the mobile stepper container (line 64) to prevent any horizontal scroll behavior or scroll indicator from appearing:

```tsx
// Line 64 — add overflow-hidden
<div className="sm:hidden overflow-hidden">
```

Also add `overflow-hidden` to the outer wrapper (line 20) to ensure no scroll leaks on tablet:

```tsx
// Line 20
<div className="w-full overflow-hidden">
```

## Files changed
- `src/components/app/catalog/CatalogStepper.tsx` — 2 lines

