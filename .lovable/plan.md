## Fix: Pills arrows overlap items in /product-visual-library

### Problem
Desktop scroll arrows on the sub-category pills row are absolutely positioned at `left-0` / `right-0` with a small negative translate. The pill scroller has no horizontal padding, so the arrows visually overlap the first/last pill (visible in the screenshot — the left arrow sits on top of "Clothing & Apparel").

### Fix (single file: `src/pages/ProductVisualLibrary.tsx`, lines ~352–420)

1. **Reserve gutter space for arrows** — when `canScrollLeft` is true, add `pl-12` to the pill scroller; when `canScrollRight` is true, add `pr-12`. This pushes the pills inward so the arrows don't sit on top of them. Padding toggles smoothly so when no overflow exists, pills use the full row.

2. **Drop the negative `-translate-x-1` / `translate-x-1`** on the arrows — they no longer need to nudge inward because the gutter reserves space.

3. **Increase arrow target size** from `h-8 w-8` to `h-9 w-9` for better tap/click ergonomics and visual balance against the 36px-ish pill height.

4. **Strengthen edge fade** — widen from `w-12` to `w-14` and add a `via-background/80` mid-stop so pills fade out smoothly behind the arrow instead of cutting off abruptly.

No behavior changes, no other files touched. Mobile (drawer) is unaffected.
