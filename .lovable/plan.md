

# Product Images Page — Revised Improvements

## Dropped items
- ~~Stepper steps~~ — keeping all 6 steps as-is
- ~~Bottom padding~~ — keeping `pb-24` as-is

## Changes — `src/pages/ProductImages.tsx`

1. **Upload card visual polish** — Add `bg-muted/40` background to the aspect-square area, move "Upload Image" label into the `h-[44px]` text area to match product card structure
2. **Product count in header** — Change "Your Products" → "Your Products (N)" showing total count
3. **Max count display** — Only show "(max 20)" when selection is ≥ 10
4. **List view product_type fallback** — Add `'\u00A0'` fallback for empty product_type in list view (grid view already fixed)
5. **Infinite scroll** — Replace "Show more" button with an `IntersectionObserver` sentinel div that auto-triggers `loadMore` when scrolled into view
6. **Keyboard/drag hint** — Add small muted text near search bar: "Tip: drag & drop or paste (⌘V) to add products"

All changes in a single file, ~40 lines modified.

