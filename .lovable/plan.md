

# Fix: Blank Grey Spacing Below Collapsed Prompt Bar on Mobile

## Problem
When the prompt panel is collapsed on mobile, it shows just the drag handle but there's a visible grey gap between it and the bottom of the screen. This is caused by:
1. The wrapper div has `pb-5` bottom padding that creates space below the collapsed bar
2. The panel container isn't pinned to the very bottom of the viewport on mobile

## Fix

### `src/pages/Freestyle.tsx` (line 912-915)

Make the bottom padding conditional — remove it when the prompt is collapsed on mobile:

```tsx
// Before
<div className="px-0 sm:px-8 pb-5 sm:pb-6 lg:pt-2 lg:pointer-events-none sm:pr-16 lg:pr-20">

// After
<div className={cn(
  "px-0 sm:px-8 lg:pt-2 lg:pointer-events-none sm:pr-16 lg:pr-20",
  isPromptCollapsed ? "pb-0" : "pb-5 sm:pb-6"
)}>
```

This eliminates the grey gap when the panel is collapsed, making the drag handle sit flush at the bottom of the screen.

One file, 1 line changed.

