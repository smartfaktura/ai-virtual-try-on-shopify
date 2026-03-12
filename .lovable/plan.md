

## Fix Freestyle Demo Panel Dimension Changes on Mobile

### Problem
On mobile (390px), when chips activate from short labels ("Product", "Scene") to longer labels ("White Crop Top", "Multi-Scene") with thumbnail images, the chips row wraps to two lines because `flex-wrap` is set. This causes the demo panel to grow in height mid-animation, creating a jarring layout shift.

### Solution
1. **Remove `flex-wrap`** from the chips row — use `flex-nowrap` with `overflow-hidden` so it never wraps
2. **Truncate chip labels on mobile** — add `max-w-[90px]` and `truncate` to chip text so "White Crop Top" becomes "White Crop..." and fits
3. **Fixed height for the chips row** — set `h-10` on the chips container so it never changes height regardless of chip state
4. **Shrink Generate button on mobile** — use shorter padding `px-3` on mobile to leave more room for chips

### Changes — `src/components/landing/FreestyleShowcaseSection.tsx`

- Line 152: Change `flex-wrap` to `flex-nowrap` and add `h-10` for fixed height
- Lines 157-181: Add `shrink-0` to chips, add `max-w-[80px] sm:max-w-none truncate` to the label text span
- Line 187: Reduce mobile padding on generate button

