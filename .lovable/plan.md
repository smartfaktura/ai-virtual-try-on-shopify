

## Fix Mobile Toolbar Overflow in Library

### Problem
On mobile, the search bar, sort buttons (Newest/Oldest), column selector, and Select button all sit in one `flex-wrap` row. The controls overflow and don't fit well on small screens. The column selector is `hidden sm:flex` but the remaining controls still crowd the space.

### Changes

**`src/pages/Jobs.tsx`** — Restructure the toolbar for mobile:

1. **Make search full-width on mobile**: Change the search container from `max-w-md flex-1` to `w-full sm:max-w-md sm:flex-1` so it takes its own row on mobile.

2. **Show column selector on mobile too**: Remove `hidden sm:flex` from the column selector div, change to `flex`. On mobile it shows the 1/2 options, which is useful.

3. **Compact the controls row on mobile**: The sort + columns + select controls will naturally wrap to a second line below the full-width search bar. Use `gap-2` instead of `gap-3` on the outer wrapper for tighter mobile spacing.

4. **Hide separators on mobile** (already done with `hidden sm:block` — keep as-is).

Single file change: `src/pages/Jobs.tsx`, ~3 lines modified in the toolbar section (lines 251–313).

