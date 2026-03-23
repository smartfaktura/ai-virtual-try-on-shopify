

# Mobile Horizontal Scroll Navigation for Dashboard CTA Buttons

## Problem
On mobile (390px), the credits + three buttons try to fit on one line but overflow. Need: credits on first line, buttons on second line as a horizontally scrollable row with fade edge — future-proof for more items.

## Changes

### `src/pages/Dashboard.tsx` (lines 414-431)

Split into two rows: credits on top, buttons below in a scrollable container with right-edge fade:

```tsx
<div className="flex flex-col gap-3 mt-5">
  {/* Credits line */}
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Sparkles className="w-4 h-4 text-primary" />
    <span><strong className="text-foreground">{balance}</strong> credits available</span>
  </div>
  
  {/* Scrollable action buttons — fade on right edge */}
  <div className="relative">
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide fade-scroll sm:flex-wrap sm:overflow-visible"
         style={{ WebkitMaskImage: undefined }}>
      <Button ...>Create Visuals</Button>
      <Button ...>Discover Ideas</Button>
      <Button ...>My Library</Button>
    </div>
  </div>
</div>
```

Key details:
- On mobile: `overflow-x-auto scrollbar-hide` for invisible horizontal scroll
- `fade-scroll` class already exists in `index.css` — applies right-edge gradient mask fade
- On desktop (`sm:`): `flex-wrap overflow-visible` so buttons just wrap normally and fade mask is removed
- Use `sm:[mask-image:none]` to disable fade on desktop
- `scrollbar-hide` class already exists in `index.css`
- Buttons get `shrink-0` to prevent text compression while scrolling

### File
- `src/pages/Dashboard.tsx` — restructure lines 414-431

