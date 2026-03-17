
## Improve Framing Selector on mobile

The current 5-column grid forces 9 items into two cramped rows with large 56px thumbnails on a 390px screen. 

### Change: `src/components/app/FramingSelector.tsx`

Convert to a **horizontal scrollable row on mobile**, keeping the grid on desktop:

- Replace `grid grid-cols-5` with `flex flex-nowrap overflow-x-auto scrollbar-hide sm:grid sm:grid-cols-5 gap-2`
- Shrink thumbnail size on mobile: `w-10 h-10 sm:w-14 sm:h-14`
- Shrink button padding on mobile: `px-1.5 py-2 sm:px-2 sm:py-3`
- Add `min-w-[4.5rem] sm:min-w-0` to each button so they don't collapse
- Hide the description, keep only label text at `text-[10px] sm:text-[11px]`

This turns the framing selector into a compact single-row swipeable strip on mobile while preserving the current grid layout on desktop.

### Files
- **Edit: `src/components/app/FramingSelector.tsx`** — responsive layout changes
