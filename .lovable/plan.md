

# Fix Zoomed-In Product Images in Start Workflow Modal

## Problem
Product images use `object-cover` inside `aspect-square` containers. When product photos have the subject filling the frame (like a crop top or jacket), `object-cover` zooms/crops aggressively to fill the square. The previous fix (`object-contain p-1`) went too far - images floated with whitespace.

## Solution

Use `object-contain` (shows the full image without cropping) combined with a solid `bg-muted` background to fill the letterbox areas cleanly. No padding needed - the background color handles the empty space naturally.

### `src/components/app/StartWorkflowModal.tsx` (line 224)

```tsx
// From:
className="w-full h-full object-cover"

// To:
className="w-full h-full object-contain"
```

The parent `div` already has `bg-muted`, so any letterbox space will blend with the card background rather than appearing as awkward whitespace. This is the middle ground: no aggressive cropping, no floating images with padding.

### File
- `src/components/app/StartWorkflowModal.tsx` - line 224 only

