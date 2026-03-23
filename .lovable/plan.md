

# Fix CTA Buttons Layout — "My Library" Getting Cut Off

## Problem
The three action buttons (Create Visuals, Discover Ideas, My Library) are inside a `flex items-center gap-2` container without `flex-wrap`. On the current viewport width, "My Library" text gets truncated/cut off at the edge.

## Fix

### `src/pages/Dashboard.tsx` (lines 414-433)

Restructure the layout so credits badge and buttons are on separate rows, and buttons wrap properly:

```tsx
<div className="flex flex-col gap-3 mt-5">
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Sparkles className="w-4 h-4 text-primary" />
    <span><strong className="text-foreground">{balance}</strong> credits available</span>
  </div>
  <div className="flex flex-wrap items-center gap-2">
    <Button variant="outline" size="sm" className="rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/workflows')}>
      <Layers className="w-3.5 h-3.5" />
      Create Visuals
    </Button>
    <Button variant="outline" size="sm" className="rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/discover')}>
      <Compass className="w-3.5 h-3.5" />
      Discover Ideas
    </Button>
    <Button variant="outline" size="sm" className="rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/library')}>
      <Image className="w-3.5 h-3.5" />
      My Library
    </Button>
  </div>
</div>
```

Key changes:
- Outer container: `flex-col` instead of `flex-row` — credits on one line, buttons on next
- Button container: add `flex-wrap` so buttons wrap on narrow screens instead of overflowing

### File
- `src/pages/Dashboard.tsx` — lines 414-433, restructure layout

