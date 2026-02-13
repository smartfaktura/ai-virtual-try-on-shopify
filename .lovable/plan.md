

## Redesign Framing Selector: 5-Column Grid with Larger Thumbnails

### Problem
The current framing options are still too small and use a basic flex-wrap layout that doesn't look polished. The user wants a proper 5-column, 2-row grid with larger, more showcase-worthy thumbnails.

### Solution
Rebuild the layout in `FramingSelector.tsx` to use a CSS grid with 5 columns per row (9 items = 5 + 4), with significantly larger thumbnails and better visual presentation.

### Technical Details

**File: `src/components/app/FramingSelector.tsx`**

- Change container from `flex gap-2 flex-wrap` to `grid grid-cols-5 gap-2`
- Increase thumbnail size from `w-10 h-10` to `w-14 h-14` for a more showcase feel
- Increase button padding slightly for breathing room
- Keep `rounded-lg object-cover` on images for clean crops
- Match the Frame icon size to `w-14 h-14`

This creates a clean 5-column layout:
```text
Row 1: [Auto] [Full Body] [Upper Body] [Close-Up] [Hand/Wrist]
Row 2: [Neck/Shoulders] [Side Profile] [Lower Body] [Back View]
```

### Files Changed
- `src/components/app/FramingSelector.tsx` (layout + sizing update)

