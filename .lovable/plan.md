

## Fix Product Edit Screen for Mobile

### Problems Identified
1. **Excessive padding on mobile** -- `px-10 pt-10 pb-10` wastes ~30% of mobile screen width
2. **Drag-to-reorder doesn't work on touch devices** -- HTML5 drag events don't fire on mobile, so users can't rearrange images at all
3. **Content gets cut off** -- When the keyboard opens, the form fields (Product Type, Description, Dimensions) are hidden behind it with no way to scroll
4. **Image thumbnails too large** -- Fixed `w-24 h-24` (96px) thumbnails take up too much horizontal space on small screens
5. **Modal not optimized for mobile** -- A Dialog with `max-h-[85vh]` leaves very little room when the mobile keyboard appears

### Solution

**1. Use Drawer on mobile, Dialog on desktop (AddProductModal)**
- Import `useIsMobile` hook
- On mobile: render a `Drawer` (vaul) that slides up from bottom with full-height scrollable content
- On desktop: keep the existing `Dialog`
- Reduce padding from `px-10` to `px-5 sm:px-8` throughout

**2. Add touch-friendly reorder controls (ProductImageGallery)**
- Add left/right arrow buttons visible on mobile (hidden on desktop where drag works)
- Reduce thumbnail size on mobile from `w-24 h-24` to `w-18 h-18`
- Make star/remove buttons always visible on mobile (no hover state on touch)
- Remove the "drag to reorder" tip text on mobile, replace with "tap arrows to reorder"

**3. Simplify the edit form layout (ManualProductTab)**
- Reduce vertical spacing on mobile (`space-y-6` to `space-y-4`)
- Make the textarea 2 rows instead of 3 on mobile
- Make the footer buttons sticky at the bottom so they're always reachable
- Reduce dropzone padding on mobile

### Files to Change

| File | Changes |
|------|---------|
| `src/components/app/AddProductModal.tsx` | Use Drawer on mobile, reduce padding |
| `src/components/app/ProductImageGallery.tsx` | Add tap-to-reorder arrows for mobile, smaller thumbnails, always-visible controls |
| `src/components/app/ManualProductTab.tsx` | Tighter spacing, sticky footer, mobile-optimized layout |

### Technical Details

**AddProductModal.tsx:**
- Use `useIsMobile()` to conditionally render `Drawer` (from vaul, already installed) vs `Dialog`
- Drawer uses `snap-points` for comfortable mobile height
- Padding: `px-5 sm:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8`

**ProductImageGallery.tsx:**
- Add `ChevronLeft`/`ChevronRight` icon buttons on each thumbnail on mobile
- Move-left swaps with previous image, move-right swaps with next
- Thumbnail size: `w-[72px] h-[72px] sm:w-24 sm:h-24`
- Star and X buttons: `opacity-100` on mobile (always visible), `opacity-0 group-hover:opacity-100` on desktop

**ManualProductTab.tsx:**
- Spacing: `space-y-4 sm:space-y-6`
- Textarea rows: 2 on mobile
- Footer: `sticky bottom-0 bg-background pt-3 pb-1 -mx-5 px-5 sm:-mx-8 sm:px-8` to stay above keyboard
- Remove the info tip text on mobile to save vertical space
