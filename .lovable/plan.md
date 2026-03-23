

# Fix Zoomed-In Workflow Images in Modal

## Problem
The modal's static workflow preview images use `object-cover`, which crops/zooms the result images (especially Product Listing Set and Virtual Try-On Set). The images need to show the full composition.

## Fix

### `src/components/app/WorkflowCardCompact.tsx` (line 57)

Change the static image (shown when `modalCompact` is true) from `object-cover` to `object-contain` with a matching background color so the full image is visible:

```tsx
<img
  src={scene?.background || workflow.preview_image_url || imgFallback}
  alt={workflow.name}
  className="w-full h-full object-contain bg-muted/50"
/>
```

This ensures the workflow result images display fully within the square card without cropping, while the subtle `bg-muted/50` fills any letterbox space cleanly.

### File
- `src/components/app/WorkflowCardCompact.tsx` - line 57, `object-cover` → `object-contain bg-muted/50`

