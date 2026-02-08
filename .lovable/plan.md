

## Fix Freestyle Image Visibility and Prompt Bar Layout

Two issues to resolve: the generated image gets cropped/clipped by the container, and the prompt bar overlaps content improperly.

---

### Root Cause

The Freestyle page uses negative margins to break out of AppShell's padding, combined with `overflow-hidden` and a fixed height of `calc(100vh - 2rem)`. When a single image is generated, the gallery centers it vertically in `h-full` with no max-height constraint, so the image overflows the visible area and gets cut off by the container bounds and the prompt bar overlay.

---

### Fix 1: Constrain the single-image view

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

For the 1-3 image layout (lines 102-129):
- Add `max-h` constraints so images never exceed the visible area minus prompt bar space
- For a single image: limit height to approximately `calc(100vh - 280px)` (leaving room for the prompt bar + some breathing room)
- Use `object-contain` instead of `object-cover` on the `<img>` so the full image is always visible without cropping
- Remove `h-full` centering on the wrapper (which forces vertical centering that pushes content behind the prompt bar) and instead use `pt-6` with top alignment so images start from the top and scroll naturally

### Fix 2: Adjust the gallery container in Freestyle.tsx

**File: `src/pages/Freestyle.tsx`**

- The scrollable content area (line 147) already has `pb-52` which should be sufficient, but the gallery's `h-full` + `flex items-center justify-center` for 1-3 images fights against the scroll padding
- The gallery wrapper for few images should NOT use `h-full` centering -- it should flow from the top with padding, allowing the scroll area to work properly

### Fix 3: Image card styling

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

In the `ImageCard` component:
- Change the `<img>` from `object-cover` to `object-contain` with a subtle background color so the full generated image is always visible
- Add `rounded-xl` and a light background (`bg-muted/30`) behind the image so non-square images look clean against the page background

---

### Summary of Changes

| File | Change |
|------|--------|
| `src/components/app/freestyle/FreestyleGallery.tsx` | Remove `h-full` centering for 1-3 images layout, use top-aligned flow with padding instead. Add max-height constraint on single images. Switch from `object-cover` to `object-contain` with background fill so images are fully visible. |
| `src/pages/Freestyle.tsx` | Minor padding adjustments to ensure the scroll area provides enough clearance above the prompt bar |

No backend or database changes needed.
