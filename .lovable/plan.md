

# Fix Discover Category Bar — Shorter Labels, Better Styling

## Problem
Category labels are too long (e.g. "Fashion & Apparel", "Health & Supplements"), causing the bar to overflow badly on desktop and mobile. The pills are small and feel cramped.

## Changes

### 1. Shorten category labels for Discover pages only

Both `src/pages/Discover.tsx` and `src/pages/PublicDiscover.tsx` — use shorter, single-word-ish labels:

```typescript
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'fragrances', label: 'Fragrances' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'home', label: 'Home' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'sports', label: 'Sports' },
  { id: 'supplements', label: 'Health' },
];
```

### 2. Improve category bar styling

**Container**: Add `flex-wrap justify-center` on desktop so pills wrap naturally instead of forcing a single scrollable row. Keep `overflow-x-auto scrollbar-hide` as fallback for mobile.

**Pills**: Slightly larger tap targets with more padding. Unselected state gets a subtle `bg-muted/30` background so they look like actual interactive elements instead of floating text.

```
px-4 py-2 → px-5 py-2
```

Selected: `bg-foreground text-background` (keep)
Unselected: `bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground`

### 3. Files changed
- `src/pages/Discover.tsx` — shorter labels, updated pill styling (Discover.tsx keeps "Saved" tab)
- `src/pages/PublicDiscover.tsx` — same changes, no "Saved" tab

### Result
All categories fit comfortably in one or two rows on desktop. Labels are scannable. Pills feel clickable and consistent with the rest of VOVV's UI.

