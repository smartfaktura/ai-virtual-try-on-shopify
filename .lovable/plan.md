

# Product Images — UX Fixes Round 6

## 4 Changes

### 1. Product cards: show full image (not zoomed/cropped), add search & type filter

**Current**: Product cards use `object-cover` on a square aspect ratio, cropping product images badly (can't see the full product). No search or filter.

**Fix**: Match the Products page (`/app/products`) pattern:
- Change `object-cover` to `object-contain` with `bg-muted` background so the full product image is visible without cropping
- Add a search input (same pattern as Products page: `Search` icon + `Input`)
- Add a type filter dropdown (using product_type values from products array)
- Show filtered count when filtering

**File**: `ProductImagesStep1Products.tsx`

### 2. Scenes grid: 5-6 columns per row

**Current**: Scene cards use `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`. Too few per row.

**Fix**: Change Universal Scenes grid to `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`. Same for category collection grids inside `CategorySection`.

**File**: `ProductImagesStep2Scenes.tsx` — update both grid class strings

### 3. Sticky bar: stop overlapping sidebar & chat button

**Current**: The sticky bar uses `fixed bottom-4 left-[var(--sidebar-width,0px)]` which sits at viewport bottom, overlapping the StudioChat button (which is `fixed bottom-4 left-4 lg:left-[var(--sidebar-offset)]` z-40). The bar also extends under the sidebar on large screens.

**Fix**: Change the sticky bar from `fixed` to use the page's scroll container. Since the main content scrolls inside `#app-main-scroll` (not the viewport), `fixed` positioning is wrong — it overlaps everything. Switch to `sticky bottom-0` inside the page content flow, with solid styling:
- `sticky bottom-0 z-20` — stays at the bottom of the scroll area, not the viewport
- `bg-background border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.05)]` — solid card with subtle top shadow
- Remove `left-[var(--sidebar-width)]` since sticky doesn't need it
- Add `mx-(-4) sm:mx-(-6) lg:mx-(-8) px-4 sm:px-6 lg:px-8` to make it full-width within the content area (canceling parent padding)
- This naturally avoids overlapping the chat button (which is `fixed`) and the sidebar

**File**: `ProductImagesStickyBar.tsx` — restyle as sticky bottom bar. `ProductImages.tsx` — remove the `mb-16` wrapper since sticky doesn't need it.

### 4. Increase bottom padding on step content

Since sticky bar is now `sticky bottom-0`, the step content `pb-20` should remain to ensure content doesn't hide behind it.

No file change needed — `pb-20` is already in each step component.

## Summary

| File | Change |
|------|--------|
| `ProductImagesStep1Products.tsx` | `object-contain` + `bg-muted`, add search input + type filter dropdown |
| `ProductImagesStep2Scenes.tsx` | Grid columns → 5-6 per row on desktop |
| `ProductImagesStickyBar.tsx` | `sticky bottom-0` with solid bg, top border + shadow |
| `ProductImages.tsx` | Remove `mb-16` wrapper around sticky bar |

