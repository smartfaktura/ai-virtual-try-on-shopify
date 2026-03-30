

## Fix Zoomed-In Product Images in Start Workflow Modal

### Problem
In the product selection step (Step 2) of the StartWorkflowModal, product thumbnails use `object-cover` on a forced `aspect-square` container. This crops/zooms images that aren't square, making them look bad — especially compared to other parts of the app where images display properly.

### Change

**File: `src/components/app/StartWorkflowModal.tsx`** (lines 252-258)

Replace the forced square crop with `object-contain` so the full product image is visible, and use a slightly larger optimized width for better quality:

```typescript
// Before
<div className="w-full aspect-square rounded-md overflow-hidden bg-muted">
  <ShimmerImage
    src={getOptimizedUrl(p.image_url, { width: 200, quality: 70 })}
    alt={p.title}
    className="w-full h-full object-cover"
    aspectRatio="1/1"
  />
</div>

// After
<div className="w-full aspect-square rounded-md overflow-hidden bg-muted">
  <ShimmerImage
    src={getOptimizedUrl(p.image_url, { width: 300, quality: 75 })}
    alt={p.title}
    className="w-full h-full object-contain"
    aspectRatio="1/1"
  />
</div>
```

- `object-cover` → `object-contain`: shows the entire product without cropping
- `width: 200, quality: 70` → `width: 300, quality: 75`: slightly higher resolution and quality to reduce compression artifacts in the modal

### Impact
- Single file, two-line change
- Product images will display fully visible without aggressive cropping
- Consistent with the optimized image quality used elsewhere in the app

