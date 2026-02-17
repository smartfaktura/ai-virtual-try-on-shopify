

## Fix Freestyle Mobile Layout -- Header Gap and Image Centering

### Root Cause

The AppShell gives main content `pt-24` (96px) on mobile to clear the fixed floating header (which is ~80px tall: 12px padding + 56px bar + 12px padding). But a `<style>` override forces `margin-top: 0 !important` on mobile, preventing the freestyle container from pulling up into that 96px padding. This creates a visible 16px grey gap between the header and the freestyle area.

Then inside the freestyle container, `pt-20` (80px) on the scroll area pushes images down even further -- double-compensating for a header the container already sits below.

### Changes in `src/pages/Freestyle.tsx`

1. **Remove the mobile margin-top override** (`margin-top: 0 !important`) and instead use `-mt-4` on mobile (already in the className). This pulls the freestyle container up by 16px so its top sits at exactly 80px from viewport top -- flush with the header bottom.

2. **Remove `pt-20` from the scroll area** on mobile. Since the container now starts right below the header, no inner compensation is needed. Use `pt-1 lg:pt-0` for a minimal gap matching the grid's `gap-1`.

3. **Fix container height**: Change from `calc(100dvh - 5.5rem)` to `calc(100dvh - 5rem)` on mobile (container starts at 80px = 5rem from top, so `100dvh - 5rem` fills exactly to the bottom). The lg+ override stays at `100dvh`.

### Summary of Line Changes

**Line 528**: Keep `-mt-4` in the className (it's already there), remove the inline height style (will be set via the style tags instead).

**Line 531**: Change the mobile `<style>` from `margin-top: 0 !important` to `height: calc(100dvh - 5rem) !important` -- this sets the correct height while letting the `-mt-4` from className work naturally.

**Line 535**: Change `pt-20 lg:pt-0` to `pt-1 lg:pt-0` on the scrollable div -- images start with just 4px gap below the container top (matching the grid gap).

These 3 changes fix the grey gap, the overlap, and the off-center images (the `-mx-4` negative margin already cancels the AppShell `px-4` symmetrically; the issue was the excess top padding pushing everything down and making the layout feel unbalanced).

