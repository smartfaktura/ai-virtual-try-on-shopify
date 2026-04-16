

# Improve Results Screen Button Layout for Mobile

## Problem
On mobile, the action buttons (Select All, Download All, Adjust, Start Over) in the Generated Images results card wrap into an awkward 2-row layout with inconsistent sizing and too much visual weight above the actual images.

## Changes

### File: `src/pages/Generate.tsx` (lines 4429-4452)

Restructure the buttons area:

1. **Stack header and buttons vertically on mobile** — keep current `flex-col` / `sm:flex-row` on the outer wrapper
2. **Make buttons a full-width grid on mobile** — use `grid grid-cols-2 sm:flex sm:flex-wrap` so buttons fill evenly in a 2-column grid on small screens and flow naturally on desktop
3. **Remove `min-h-[44px]`** from individual buttons (the grid layout already gives enough touch target) and use consistent `w-full sm:w-auto` sizing
4. **Group primary actions** — keep Select All and Download All prominent, make Adjust and Start Over secondary

```tsx
// Lines 4429-4452 — Before:
<div className="flex flex-wrap gap-2">
  <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0" ...>Select All</Button>
  <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0" ...>Download All</Button>
  <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0" ...>Adjust</Button>
  <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0" ...>Start Over</Button>
</div>

// After:
<div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
  <Button variant="outline" size="sm" className="h-9" ...>Select All</Button>
  <Button variant="outline" size="sm" className="h-9" ...>Download All</Button>
  <Button variant="outline" size="sm" className="h-9" ...>Adjust</Button>
  <Button variant="outline" size="sm" className="h-9" ...>Start Over</Button>
</div>
```

This gives a clean 2x2 grid on mobile with equal button widths, and flows inline on desktop.

### Files
- `src/pages/Generate.tsx` — button container class change (~line 4429)

