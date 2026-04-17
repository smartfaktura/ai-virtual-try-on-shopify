

## Goal
When the floating sticky plan-selector bar appears on `/app/pricing` (after scrolling past the comparison table), hide the global custom support widget so the two don't overlap.

## File
- `src/pages/AppPricing.tsx`

## Investigation needed
Quick check on how the support widget is rendered/controlled (global component, context, or CSS class), so I can hide it cleanly only while the sticky bar is visible on this page.

## Approach
1. Locate the support widget (likely a global floating button mounted in `AppShell` or similar). Identify the cleanest hide mechanism — either:
   - A context/provider toggle (preferred), or
   - A body/root class (e.g. `data-hide-support`) that the widget's CSS respects, or
   - A simple CSS selector targeting the widget's container.
2. In `AppPricing.tsx`, drive that hide state from the existing `pastCompare` boolean (already controls sticky bar visibility):
   - When `pastCompare === true` → hide support widget.
   - When `pastCompare === false` → restore.
3. Cleanup on unmount: ensure widget is restored when leaving `/app/pricing` (return cleanup in `useEffect`).

## Result
Sticky plan-selector bar and support widget never visible at the same time. No layout overlap on mobile or desktop. No impact on other `/app/*` pages.

