

## Recent Creations Preview Modal

When clicking a thumbnail in the Recent Creations row, instead of navigating to the Library, a dialog opens showing all generated images from that specific workflow job. Images are loaded lazily (only after the modal opens), with shimmer placeholders. A download button offers single-image download or ZIP for multiple images.

### UX Flow

```text
User clicks thumbnail card
       |
       v
+--------------------------------------+
| "Virtual Try-On Set"     [X]         |
| 4 images - 2 minutes ago             |
|                                      |
| [shimmer] [shimmer] [shimmer] [shim] |
|   (signs URLs + loads images)        |
|   ...becomes...                      |
| [img1]   [img2]   [img3]   [img4]   |
|                                      |
| Clicking any image opens lightbox    |
|                                      |
| [View All in Library]  [Download]    |
+--------------------------------------+
```

- 1 image: "Download" button downloads directly
- 2+ images: "Download All" button downloads as .zip

### Technical Changes

**New file: `src/components/app/WorkflowPreviewModal.tsx`**

A dialog component that receives the job data (id, workflow_name, created_at, results, requested_count). On open:
1. Extracts all URLs from `results` (flat string array)
2. Calls `toSignedUrls()` once to batch-sign them
3. Renders a grid of `ShimmerImage` components with shimmer while signing
4. Click on any image opens the existing `ImageLightbox`
5. Footer has two buttons:
   - "View All in Library" -- navigates to `/app/library`
   - "Download" (1 image) or "Download All (N)" (2+ images)
     - Single: calls `downloadSingleImage` from `dropDownload.ts`
     - Multiple: calls `downloadDropAsZip` with progress indicator
6. Download button shows a spinner/progress while downloading

**Modified file: `src/components/app/WorkflowRecentRow.tsx`**

- Add state: `selectedJob: RecentJob | null`
- Change `ThumbnailCard` onClick from `navigate('/app/library')` to `onSelect(job)`
- Render `WorkflowPreviewModal` at the bottom of the component, controlled by `selectedJob`

### Files

| File | Action |
|------|--------|
| `src/components/app/WorkflowPreviewModal.tsx` | Create |
| `src/components/app/WorkflowRecentRow.tsx` | Modify (add modal trigger) |

### Key Details

- No images are loaded until the modal opens -- the `toSignedUrls` call only fires inside the modal's `useEffect` when `open` becomes true
- Uses existing `ShimmerImage` for consistent loading UX
- Uses existing `ImageLightbox` for full-screen viewing with arrow navigation
- Uses existing `downloadDropAsZip` and `downloadSingleImage` from `dropDownload.ts`
- Uses existing `toSignedUrls` for batch URL signing
- Download progress shown via a percentage on the button text for ZIP downloads
