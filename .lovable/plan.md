

## Improve sticky navigation bar to floating design

### Problem
The current fixed bottom bars in the Virtual Try-On model and scene steps are full-width with transparent background, overlapping the customer support icon. Need to match the Perspectives flow's floating bar design.

### Changes

**File: `src/pages/Generate.tsx`** — Two bars (model step ~line 2884, scene step ~line 2935)

Replace both full-width fixed bars with the same floating pattern used in Perspectives:

**Before (both bars):**
```tsx
<div className="fixed bottom-0 left-0 right-0 lg:left-[var(--sidebar-offset)] z-50 bg-background/95 backdrop-blur-sm border-t border-border">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between">
```

**After (both bars):**
```tsx
<div className="sticky bottom-4 z-50 max-w-3xl mx-auto">
  <div className="bg-background border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4">
```

Key differences from current:
- `sticky bottom-4` instead of `fixed bottom-0 left-0 right-0` — floats within content flow, no sidebar offset needed
- `max-w-3xl` — narrower, won't overlap support icon
- `bg-background` — full opacity, no transparency
- `rounded-2xl shadow-lg` — floating card look matching Perspectives
- Remove `border-t` → use `border` all around
- Remove the `pb-20` padding on wrapper divs (no longer needed with sticky vs fixed)

