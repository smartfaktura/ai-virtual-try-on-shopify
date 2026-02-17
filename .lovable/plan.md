

## Redesign: Split-Screen Preview Modal (No Nested Modals)

### Problem

Clicking a thumbnail in `WorkflowPreviewModal` opens `ImageLightbox` as a second full-screen overlay stacked on top of the Dialog. Both are z-50, causing visual glitching and a confusing UX with two overlapping modals.

### Solution

Replace the current grid-only modal + separate lightbox with a single split-screen Dialog:

```text
Desktop (>= 640px):
+-------------------------------------------+
| Virtual Try-On Set              [X]       |
| 4 images - 2 minutes ago                  |
+-------------------------------------------+
|                        |                  |
|                        | [thumb] [thumb]  |
|   Large Preview        | [thumb] [thumb]  |
|   (selected image)     |                  |
|                        |                  |
+-------------------------------------------+
| [View All in Library]     [Download All]  |
+-------------------------------------------+

Mobile (< 640px):
+---------------------------+
| Virtual Try-On Set   [X]  |
| 4 images - 2 min ago      |
+---------------------------+
|                           |
|     Large Preview         |
|     (selected image)      |
|                           |
+---------------------------+
| [t1] [t2] [t3] [t4]      |
+---------------------------+
| [Library]  [Download All] |
+---------------------------+
```

### Key Changes

**`src/components/app/WorkflowPreviewModal.tsx`** -- Full rewrite of the layout:

1. Remove `ImageLightbox` entirely -- no nested modal
2. Add `selectedIndex` state (default 0) to track which image is shown large
3. Layout becomes a split-screen:
   - **Desktop**: Left side = large preview image (flex-1), Right side = scrollable thumbnail grid (fixed width ~200px)
   - **Mobile**: Top = large preview, Bottom = horizontal scrollable thumbnail strip
4. Clicking a thumbnail sets `selectedIndex` -- no new modal opens
5. Selected thumbnail gets a ring highlight
6. Footer stays the same: "View All in Library" + "Download" buttons
7. Dialog max-width increases to `max-w-4xl` for the split layout
8. Single image download button changes to download just the previewed image, "Download All" for the full set

### Files to Modify

| File | Change |
|------|--------|
| `src/components/app/WorkflowPreviewModal.tsx` | Replace grid+lightbox with split-screen layout |

### Technical Details

- Remove all `lightboxIndex` state and `ImageLightbox` import
- Add `selectedIndex` state (number, default 0)
- Desktop: `flex flex-row` with large image on left, thumbnail column on right
- Mobile: `flex flex-col` with large image on top, horizontal thumbnail row below
- Thumbnails use `button` with `ring-2 ring-primary` when selected
- Large preview uses `ShimmerImage` with `object-contain` for proper aspect ratio display
- Keep lazy URL signing unchanged
- Keep download logic unchanged
- Add keyboard navigation (left/right arrows) for browsing images within the modal

