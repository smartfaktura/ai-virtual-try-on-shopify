

## Fix Framing Selector Design in Virtual Try-On Workflow

### Problem
The Framing selector in the Virtual Try-On workflow settings has two issues:
1. **Thumbnails are too small** -- images are only 20x20px (`w-5 h-5`), making them hard to see
2. **Horizontal carousel scroll** -- the `overflow-x-auto` creates a scrollbar, cutting off items like "Back View"

### Solution
Update `FramingSelector.tsx` to use a **wrapping grid layout** with larger thumbnails:

- Change the container from `flex overflow-x-auto` to `flex flex-wrap` so all options wrap to multiple rows instead of scrolling
- Increase image size from `w-5 h-5` (20px) to `w-10 h-10` (40px) for better visibility
- Increase the icon size for the "Auto" option to match
- Slightly increase the minimum button width from `72px` to `80px` for better proportions
- Remove `flex-shrink-0` since wrapping handles layout

### Technical Details

**File: `src/components/app/FramingSelector.tsx`**

| Line | Current | New |
|------|---------|-----|
| 20 | `flex gap-2 overflow-x-auto pb-1 -mx-1 px-1` | `flex gap-2 flex-wrap` |
| 26 | `min-w-[72px] ... flex-shrink-0` | `min-w-[80px]` (remove flex-shrink-0) |
| 33 | `w-5 h-5 rounded-full` | `w-10 h-10 rounded-lg` |
| 35 | `w-5 h-5` (Frame icon) | `w-10 h-10` |

No other files need changes.

