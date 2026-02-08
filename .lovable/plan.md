

## Fix: Prevent Gallery Images from Overlapping the Prompt Bar

The bottom row of generated images slides behind the pinned prompt bar, hiding the hover actions (download, expand, delete). The fix ensures proper spacing so all images and their hover overlays remain fully accessible.

---

### Root Cause

The scrollable content area uses `pb-52` (208px) as bottom padding, but the prompt panel is taller than that (~240px including the gradient fade). Additionally, the masonry layout uses `gap-1` and `p-1` which provides almost no clearance. The last row of images ends up behind the prompt bar + gradient.

### Changes

**File: `src/pages/Freestyle.tsx`**

- Increase the bottom padding on the scrollable content area from `pb-52` to `pb-72` (288px). This gives enough clearance for the prompt bar (~240px) plus breathing room so hover actions on the last row of images are fully visible and interactive.

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

- For the masonry layout (4+ images), add bottom padding to the container so the last row has clearance
- For the 1-3 images layout, ensure max-height accounts for prompt bar height properly

This is a two-line change across two files -- just padding adjustments, no structural changes.
