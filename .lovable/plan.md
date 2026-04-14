

# Fix Short Film Reference Pickers

## Problems

1. **Product picker loads raw product catalog images** -- shows the full `user_products` library (close-up texture/detail shots) which is not useful for short film references. Should instead use the scene library organized by category, similar to the Product Images workflow.

2. **Images are too zoomed/cropped** -- All picker grids use `object-cover` which crops images to fill the square. Product Images uses `object-contain` with a white/muted background so the full image is visible.

3. **Titles not visible** -- `text-[10px]` with `truncate` makes product/scene names nearly unreadable. No padding or contrast.

## Plan

### File: `src/components/app/video/short-film/ReferenceUploadPanel.tsx`

**A. Replace Product picker with categorized Scene-style picker**
- The "Product References" Library button should open a picker that shows the user's actual products (from `user_products`) but with `object-contain` + white background so the full product image is visible, plus readable titles.
- Keep the product picker but fix its display -- the data source is correct (user's own products), just the rendering is broken.

**B. Fix all picker image rendering**
- Change `object-cover` to `object-contain` on all picker `ShimmerImage` components.
- Add `bg-white` or `bg-muted/30` background to the image container so contained images have a clean backdrop.
- This matches the Product Images pattern: `className="w-full aspect-square object-contain rounded bg-white"`.

**C. Fix title visibility**
- Increase title text from `text-[10px]` to `text-xs` (12px).
- Remove `truncate` or increase card width to show more of the name.
- Add slight padding (`p-2`) to the title area for breathing room.

**D. Scene picker: add category grouping**
- Use `categoryCollections` from `useProductImageScenes()` (already available) to group scenes by category in the picker dialog, matching the Product Images Step 2 pattern.
- Show category headers with scene grids underneath, making it easier to find relevant scenes.

### Files to change

| File | Change |
|------|--------|
| `src/components/app/video/short-film/ReferenceUploadPanel.tsx` | Fix `object-cover` to `object-contain bg-white`, improve title sizing, add category grouping to scene picker |

