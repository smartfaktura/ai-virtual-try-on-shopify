

## Fix Mobile Lightbox: Share Button Alignment + Arrow Visibility

### Problems
1. **Share (Trophy) button** is on a separate row below the other action buttons — should be in the same row
2. **Navigation arrows** are hard to see on mobile — low contrast glass buttons on dark background, small size

### Changes to `src/components/app/ImageLightbox.tsx`

**1. Move Share into the same row (lines 142-184)**

Remove the `flex-col` wrapper and the separate `onShare` block. Put the Trophy button inline with Download, Copy, Delete in the single `flex` row.

**2. Improve mobile navigation arrows (lines 94-115)**

- Replace the translucent `bg-white/10` circles with solid `bg-white/20` buttons and a slightly larger size (`w-10 h-10`)
- Add a subtle border (`border border-white/20`) for better edge definition
- Alternatively, use swipe gestures instead of arrows — but arrows are simpler to fix now

Result: all action buttons in one clean row, arrows more visible on mobile.

