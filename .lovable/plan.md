

# Disable MetricCard Hover Popovers on Mobile

## Problem
The hover-triggered popovers on dashboard metric cards don't work well on mobile (no hover events on touch devices).

## Fix
**`src/components/app/MetricCard.tsx`**

1. Import `useIsMobile` hook
2. Call it inside the component
3. When `isMobile` is true, skip the Popover wrapper entirely — just return `cardContent` directly (same as the `if (!tooltip)` branch)

This is a ~3-line change: one import, one hook call, and updating the condition from `if (!tooltip)` to `if (!tooltip || isMobile)`.

