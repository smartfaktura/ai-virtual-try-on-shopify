
## Fix plan: stop horizontal slide on Product Visuals mobile

The sideways movement is still coming from layout width, not from the scene cards alone. The screenshot shows the whole Step 2 page can be dragged beyond the viewport, which means at least one parent row is still wider than 440px.

### What I found in code

1. `src/components/app/product-images/ProductImagesStep2Scenes.tsx`
   - The main Step 2 picker already has `overflow-x-clip max-w-full`.
   - But some internal rows can still force width on mobile:
     - top toolbar: title + selected badge/clear + grid toggle in one row
     - subgroup header: label + curator hint + divider + Select All in one row
     - category trigger rows use non-wrapping horizontal layouts

2. `src/pages/ProductImages.tsx`
   - The page root wrapper is still just `space-y-6 pb-24`
   - So even if Step 2 clips itself, any wider child can still expand the full page width

3. `src/components/app/product-images/ProductContextStrip.tsx`
   - The strip uses `overflow-x-auto` for product thumbnails
   - But the container itself does not have strong `min-w-0 / max-w-full` containment, so it can contribute to page-wide overflow on small screens

4. `src/components/app/product-images/ProductImagesStickyBar.tsx`
   - The sticky bottom bar is likely part of the bleed zone in mobile
   - It needs explicit width containment so it never becomes wider than the page content

### Safe implementation

#### 1) Add page-level horizontal containment
Edit `src/pages/ProductImages.tsx`
- Add `overflow-x-clip max-w-full` to the top-level page wrapper
- Add `min-w-0 max-w-full` to the wizard content container around step content

This makes the whole Product Visuals page respect the viewport, not just the Step 2 picker.

#### 2) Make the Step 2 top toolbar wrap safely on mobile
Edit `src/components/app/product-images/ProductImagesStep2Scenes.tsx`
- Change the header row from a strict `justify-between` layout to a mobile-safe stacked or wrapped layout
- Example direction:
  - mobile: title on first line
  - controls on second line with `flex-wrap`
- Ensure the controls group has `min-w-0`
- Keep `GridSizeToggle` from forcing width

This is one of the most likely overflow sources on 440px.

#### 3) Harden all Step 2 rows that can grow too wide
Edit `src/components/app/product-images/ProductImagesStep2Scenes.tsx`
- Add `min-w-0 max-w-full` to:
  - From Explore wrapper
  - category section wrappers
  - row triggers
  - expanded category content wrapper
- Update subgroup header layout so it wraps on mobile:
  - label + hint can wrap
  - divider can hide or shrink on mobile
  - `Select All` can move below/right instead of forcing one line
- Add `truncate/min-w-0` where labels may stretch

#### 4) Contain the product context strip
Edit `src/components/app/product-images/ProductContextStrip.tsx`
- Add `min-w-0 max-w-full overflow-hidden` to the outer strip
- Add `min-w-0 flex-1` to the thumbnails lane
- Keep inner thumbnail scrolling, but prevent it from increasing page width

This keeps horizontal scrolling local to the strip instead of the whole page.

#### 5) Contain the sticky bottom action bar
Edit `src/components/app/product-images/ProductImagesStickyBar.tsx`
- Add `max-w-full overflow-hidden` to the sticky wrapper and card
- Ensure the mobile action row can shrink without exceeding viewport
- If needed, add `min-w-0` to button row and CTA button

This should stop the bottom bar from being the element that widens the page.

### Files to change

```text
EDIT  src/pages/ProductImages.tsx
      - add page-level overflow-x-clip / max-w-full containment
      - contain wizard content width

EDIT  src/components/app/product-images/ProductImagesStep2Scenes.tsx
      - make top toolbar mobile-safe
      - add min-w-0 / max-w-full to Step 2 wrappers
      - let subgroup/category headers wrap instead of forcing one row
      - keep From Explore section contained

EDIT  src/components/app/product-images/ProductContextStrip.tsx
      - keep thumbnail scroller local, not page-wide

EDIT  src/components/app/product-images/ProductImagesStickyBar.tsx
      - add max-w-full / overflow-hidden width containment on mobile
```

### Validation

1. Open Product Visuals at 440px width on Step 2
2. Scroll vertically through the page
3. Confirm the page cannot be dragged left/right beyond the viewport
4. Confirm the sticky bottom bar stays fully inside the viewport
5. Confirm From Explore card, category rows, and Select All headers do not push page width
6. Confirm thumbnail strip can still scroll internally if needed, without moving the whole page

### Note on the build error

The error shown is an R2 credential timeout during dist upload, not a TypeScript/React compile failure. I would treat that as a separate deploy infrastructure retry issue unless a new actual code build error appears after these layout fixes.
