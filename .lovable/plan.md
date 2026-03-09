

## Fix Horizontal Layout Loading Card Text Overflow

**Problem:** When 16:9 aspect ratio is selected, the `GeneratingCard` uses `flex-col` layout which stacks avatar, status text, and progress bar vertically. The short height of 16:9 causes content to overflow or get cut off.

**Solution:** Switch to a horizontal (side-by-side) layout when the aspect ratio is wide (16:9, 3:2). The avatar goes on the left, text and progress bar on the right.

### Changes

| File | Change |
|------|--------|
| `src/components/app/freestyle/FreestyleGallery.tsx` | Detect wide ratios (`16:9`, `3:2`) and switch `GeneratingCard` to a `flex-row` layout — avatar on left, text + progress stacked on right. Reduce avatar size and tighten spacing for short containers. |

**Layout logic:**
- Wide ratios → `flex-row` with `items-center`, smaller avatar (`w-10 h-10`), text left-aligned
- Square/tall ratios → keep existing `flex-col` centered layout

