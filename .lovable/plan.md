

## Align Freestyle Grid Top with Sidebar Top Edge (Desktop)

### Problem

On desktop, the sidebar floats with `m-3` (12px) margin from the viewport top. The freestyle grid currently starts at ~4px from the top (`lg:pt-1`), which is above the sidebar's top edge. The user wants the grid's first row of images to start at the same vertical position as the sidebar's top edge.

### Changes

**File: `src/components/app/freestyle/FreestyleGallery.tsx`** (or `src/pages/Freestyle.tsx`)

The scrollable content area on line 535 currently uses `pt-[5rem] lg:pt-1`. Change `lg:pt-1` to `lg:pt-3` (12px) so the grid's top padding on desktop matches the sidebar's 12px top margin.

**Line 535**: Change `pt-[5rem] lg:pt-1` to `pt-[5rem] lg:pt-3`

This single change aligns the grid's top edge with the sidebar's top edge on desktop. Mobile/tablet padding remains unchanged at 80px (`5rem`).

