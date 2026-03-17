

## Replace horizontal scroll with compact wrapped grid on mobile

The horizontal scroll doesn't look good. Instead, use a **tight wrapped grid** that fits all 9 items (Auto + 8 framings) neatly on mobile.

### Change: `src/components/app/FramingSelector.tsx`

- Remove `flex flex-nowrap overflow-x-auto scrollbar-hide` on mobile
- Use `grid grid-cols-5 gap-1.5 sm:gap-2` for both mobile and desktop — 5 columns fits 9 items in 2 rows
- Shrink mobile thumbnails to `w-8 h-8` (32px) and buttons to `min-h-0 px-1 py-1.5` so everything fits without scrolling
- Keep desktop at `w-14 h-14` with more padding
- Font stays `text-[10px]` on mobile

This gives a compact 2-row grid (5+4) that fits within 390px without any scrolling.

