

## Fix: Spacing Between Cards on Mobile Freestyle

### Problem
On the mobile Freestyle page, the generated image cards and the "Recreating look from Discover" banner are too tightly packed. There are two spacing gaps:

1. **Between the banner area and the gallery** — no gap exists between the banner container (`space-y-2` div at line 924) and the `FreestyleGallery` that follows it.
2. **Between gallery image cards** — the masonry grid uses `gap-2` (8px) both horizontally and vertically, which is too tight on mobile for visual comfort.

### Changes

**File: `src/pages/Freestyle.tsx`**
- Add `mb-2` to the banner container div (line 924) so there's consistent spacing before the gallery starts.

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**
- Increase the masonry gap from `gap-2` to `gap-2.5` (line 665 outer div and line 667 column div) for slightly more breathing room between cards on all screens.

### Impact
- Two-line change affecting only spacing values.
- No layout or functionality changes.

