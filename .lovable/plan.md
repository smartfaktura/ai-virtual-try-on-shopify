Yes — I see it now. The sticky navigation is not rendering correctly on mobile:

- The Back button is squeezed/cropped so it looks like a dark block or overlaps the Continue button
- The bottom sticky card is sitting directly over the content instead of giving enough breathing room
- The mobile bar is wider/taller than it needs to be, which makes the buttons feel duplicated/stacked and broken

## Plan

1. **Fix the mobile sticky button row**
   - Give the Back button a stable width
   - Prevent the Continue button from overlapping it
   - Keep both buttons in one clean row
   - Ensure the Back button only shows on steps 2-4

2. **Make the sticky card fit mobile screens cleanly**
   - Reduce horizontal overflow risk with safe `w-full`, `max-w-full`, and better inner spacing
   - Keep the rounded white card but prevent its content from clipping
   - Add iPhone safe-area bottom spacing so Safari’s bottom toolbar does not collide with it

3. **Increase page bottom clearance**
   - Add enough bottom padding to the Product Visuals page and Step 2 scene grid so the sticky bar does not cover scene cards or section headers while scrolling

## Files to update

- `src/components/app/product-images/ProductImagesStickyBar.tsx`
- `src/pages/ProductImages.tsx`
- `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

After approval, I’ll implement this directly.