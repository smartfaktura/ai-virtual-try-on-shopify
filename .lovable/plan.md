

## Align Queue Bar and Generating Cards with the Freestyle Grid

### What's Happening

The queue status bar (showing generation progress, time estimates, team messages) and the generating placeholder cards don't align horizontally with the image grid. The grid uses very tight padding (`px-1`), while the queue bar sits in a wider wrapper (`px-4 sm:px-6`). This makes them look like separate elements rather than part of the same canvas.

### What Will Change

1. **Queue bar padding** -- Change the wrapper around the QueuePositionIndicator from `px-4 sm:px-6 pt-4` to `px-1 pt-3` so it starts and ends at the exact same edges as the masonry grid columns below it.

2. **Generating card wrappers (few-items layout)** -- When there are 3 or fewer items, the centered layout uses `px-6 pt-6`. This will be updated to `px-1 pt-3` to match the grid padding.

3. **Generating card min-width** -- Remove the `min-w-[280px]` constraint on generating and blocked card wrappers so they size naturally within the grid rather than forcing their own width.

### Technical Details

**File: `src/pages/Freestyle.tsx`** (line 540)
- Change the QueuePositionIndicator wrapper from `className="px-4 sm:px-6 pt-4"` to `className="px-1 pt-3"` to match the masonry grid's `px-1 pt-3`

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**
- Line 426: Change `"flex items-stretch justify-center gap-3 px-6 pt-6"` to `"flex items-stretch justify-center gap-1 px-1 pt-3"` (matching grid gap and padding)
- Lines 428, 431: Remove `min-w-[280px]` from generating and blocked card wrappers

This ensures the queue bar, generating placeholders, and image grid all share the same left edge, right edge, gap, and top spacing.
