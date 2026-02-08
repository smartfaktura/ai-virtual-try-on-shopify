

## Fix Image Visibility and White Border Artifacts

Two issues to resolve: the generated image still extends behind the prompt bar, and white stripes appear around image edges.

---

### Issue 1: Image overlapping the prompt bar

**Root Cause**: The Freestyle page sits inside AppShell's `<main>` which wraps content in a `<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">`. The page uses negative margins to break out of this padding, but sets `height: 100vh` which is the full browser viewport -- not the actual available space inside the main area. Combined with the inner scrollable div also scrolling, the image's `max-h-[calc(100vh-320px)]` doesn't leave enough real room for the prompt bar.

**Fix in `src/components/app/freestyle/FreestyleGallery.tsx`**:
- Increase the max-height clearance from `calc(100vh - 320px)` to `calc(100vh - 400px)` for single images. This accounts for the prompt panel height (~240px), the AppShell padding (~32px top + bottom), plus breathing room.
- For 2-3 images side by side, use the same increased clearance.

### Issue 2: White stripes around image edges

**Root Cause**: The ImageCard has `bg-muted/30` as a background fill and uses `object-contain`, which means portrait images don't fill the full container width. The remaining space shows the background color as visible light stripes on the sides.

**Fix in `src/components/app/freestyle/FreestyleGallery.tsx`**:
- For single-image display, change the approach: instead of a fixed-width container with `object-contain`, let the image size naturally using `w-auto h-auto max-h-[...] mx-auto` so it takes its natural proportions without any container background showing.
- Remove `bg-muted/30` from the single-image card (no background means no stripes).
- Keep `rounded-xl` and `shadow` on the image itself for polish.
- For the masonry grid (4+ images), keep the current approach since `object-contain` works well in columns.

---

### Summary of Changes

| File | Change |
|------|--------|
| `src/components/app/freestyle/FreestyleGallery.tsx` | For 1-3 images: remove fixed-width container approach, use naturally-sized image with `w-auto h-auto` centered with `mx-auto`, increase max-height to `calc(100vh - 400px)`, remove `bg-muted/30` from card to eliminate white stripes. Keep masonry layout for 4+ images as-is. |

Single file change, no backend modifications needed.

