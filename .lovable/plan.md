

# Make Credit Indicator Clickable with Bigger Tap Area

## Problem
On mobile, the plan/credits section at the bottom of the sidebar is small and not easily tappable. The user wants a bigger clickable area to navigate to plans/settings.

## Change

### File: `src/components/app/CreditIndicator.tsx`

Wrap the entire outer `div` (line 19) in a clickable container that navigates to `/app/settings` on tap. The `+` buy button will keep its own `onClick` with `stopPropagation` so it still opens the buy modal independently.

- Change the outer `div` to a `button` (or add `onClick` + `cursor-pointer`) that navigates to `/app/settings`
- Increase padding from `p-3` to `p-4` for a larger touch target
- Add `active:scale-[0.98]` for tactile feedback
- Add `stopPropagation` on the `+` button and Upgrade button so they don't trigger the outer navigation

### Files
- `src/components/app/CreditIndicator.tsx` — 1 file, ~4 line changes

