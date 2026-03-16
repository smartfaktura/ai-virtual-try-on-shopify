

## Plan: Add Upscale & Perspectives buttons to WorkflowPreviewModal

### Problem
The `WorkflowPreviewModal` only shows Download and "View in Library" actions. Users don't discover they can upscale or generate perspectives from these images.

### Approach
Add two new action buttons ("Upscale" and "Perspectives") in the right info panel of `WorkflowPreviewModal`, between the download buttons and "View in Library" link. Each button navigates the user to the relevant page with the current image pre-selected.

### Changes

**`src/components/app/WorkflowPreviewModal.tsx`**

1. Import `Maximize` (for upscale) and `Layers` (for perspectives) icons, plus `UpscaleModal` and its types
2. Add state for `upscaleModalOpen`
3. Add two new buttons after the download section:
   - **Upscale** — opens the `UpscaleModal` inline (same pattern as `LibraryDetailModal`) with the current image as the item
   - **Perspectives** — navigates to `/app/perspectives?source=<encodedSignedUrl>` with the current image URL, which the Perspectives page already supports via `searchParams.get('source')`
4. Render `<UpscaleModal>` at the bottom of the component

Button styling will match the existing "Download All" secondary button style (muted/30 bg, rounded-xl).

### Routing details
- **Perspectives**: Already reads `?source=<url>` param → sets `sourceType='scratch'` and `directUploadUrl` automatically
- **Upscale**: Opens inline modal with `UpscaleItem` containing `imageUrl`, `sourceType: 'generation'`, `sourceId: job.id`

