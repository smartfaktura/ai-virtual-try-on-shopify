

# Fit Category Bar to Screen — Desktop & Mobile

## Problem
11 category pills wrap to 2 rows on desktop (Health orphaned on row 2). On mobile, the row is too wide and needs a modern invisible scroller.

## Solution

### Desktop: Single-row horizontal scroll with fade edges
Instead of `flex-wrap`, use a single scrollable row with gradient fade masks on left/right edges to hint at more content. This is the modern pattern used by Netflix, Airbnb, etc.

- Remove `flex-wrap justify-center`
- Use `overflow-x-auto scrollbar-hide` with `justify-start` (or center if content fits)
- Add CSS gradient masks on the container edges using `mask-image: linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)` — fades out pills at edges to signal scrollability
- Slightly reduce pill size: `px-5 py-2 text-sm` — this should let all 11 fit or nearly fit on most desktops without wrapping

### Mobile: Same invisible scroller
- Same horizontal scroll behavior
- `scrollbar-hide` already in CSS
- Gradient fade edges work here too
- Pills stay `shrink-0 whitespace-nowrap`

### Files changed
- `src/pages/PublicDiscover.tsx` (line 346) — update container classes
- `src/pages/Discover.tsx` (line 447) — same update
- `src/index.css` — add `.fade-scroll` utility with mask-image for the gradient edge effect

### Container markup (both pages)
```html
<div className="fade-scroll flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1 px-2">
```

### CSS utility
```css
.fade-scroll {
  mask-image: linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent);
}
```

### Pill size adjustment
Slightly smaller to maximize fit: `px-5 py-2 text-sm` (from `px-6 py-2.5 text-[15px]`). Still generous, still premium — just not wasteful with space.

