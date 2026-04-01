

# Redesign Camera Motion Grid — Responsive Wrapping Layout

## Problem
Current grid uses `flex` with `overflow-x-auto` (horizontal scroll), cards are fixed 88px wide. User wants all motions visible without scrolling, in a wrapping grid: 5 per row desktop, 4 tablet, 3 mobile.

## Change: `src/components/app/video/CameraMotionGrid.tsx`

Replace the horizontal scroll `flex` container with a CSS Grid:
- `grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2`
- Remove `overflow-x-auto`, `flex-shrink-0`, fixed `w-[88px]`
- Cards become fluid width filling their grid cell
- Keep aspect-square video area, hover-to-play, selected state, label below
- Keep multi-select badge and tooltip in header
- Slightly improve card styling: softer border radius, subtle hover scale

Single file change only.

