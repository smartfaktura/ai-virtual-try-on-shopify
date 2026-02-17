

## Fix: Collapsed Prompt Panel Not Clickable on Mobile

### Root Cause

The `Freestyle.tsx` layout uses `flex flex-col` with `height: 100dvh` and `overflow-hidden` on mobile. The gallery div has `flex-1` which consumes all available vertical space. After the recent merge, the prompt panel container sits after the gallery in normal document flow on mobile but has no `flex-shrink-0`, so it gets pushed below the visible area or compressed to zero height.

Previously, the mobile panel had its own `lg:hidden overflow-visible` container that was a proper flex child. That was removed during the merge.

### Fix

**File: `src/pages/Freestyle.tsx` (line 583)**

Add `flex-shrink-0` to the prompt panel wrapper so it always retains its natural height on mobile, and add `relative z-20` for mobile stacking:

```tsx
// Before:
<div className="lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:z-20">

// After:
<div className="flex-shrink-0 relative z-20 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">
```

This ensures:
- **Mobile**: The panel is a non-collapsible flex child at the bottom of the column, always visible and clickable (collapsed or expanded)
- **Desktop**: `lg:absolute` overrides the flex behavior, keeping the floating bar positioned at the bottom as before

### Single line change

Only one line in one file needs to change. The `flex-shrink-0` prevents the flex container from compressing the panel, and `relative z-20` ensures it stacks above the gallery on mobile (replacing the `lg:z-20` which only applied on desktop).

