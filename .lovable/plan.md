

# Fix Generated Results Not Grouping by Format

## Problem
The results grid shows all images in a flat layout with ugly white space because:
1. The try-on edge function doesn't return `variations` labels
2. The aggregation code (line 1586-1594) tries to match job keys like `productId_modelId_poseId_ratio_framing` against `product.id` — never matches, so labels are always empty
3. Empty labels → grouping code is skipped → flat grid with mixed aspect ratios

## Solution
Build labels client-side from the composite job keys during aggregation, grouping by aspect ratio and framing.

### File: `src/pages/Generate.tsx` (~lines 1582-1594)

**Change the aggregation loop** to:
1. Parse the composite key (`productId_modelId_poseId_ratio_framing`) to extract ratio and framing
2. Look up product name from `productQueue` using the product ID portion of the key
3. Build a label like `"Product Name — 4:5 Portrait"` or `"Product Name — 1:1 Close-Up"` for each image
4. When the edge function returns no `variations` labels, generate them from the key parts

```typescript
for (const [key] of multiProductJobIds) {
  const r = completedResults.get(key);
  if (r) {
    // Parse key: productId_modelId_poseId_ratio_framing
    const parts = key.split('_');
    const productId = parts[0];
    const ratioVal = parts[parts.length - 2]; // e.g. "4:5"
    const framingVal = parts[parts.length - 1]; // e.g. "close_up" or "null"
    const product = productQueue.find(p => p.id === productId);
    const prefix = product?.title || '';
    
    // Build label from key if edge function didn't provide one
    const labels = r.labels.length > 0
      ? r.labels
      : r.images.map(() => {
          const parts = [ratioVal];
          if (framingVal && framingVal !== 'null') parts.push(framingVal.replace(/_/g, ' '));
          return parts.join(' · ');
        });
    
    allImages.push(...r.images);
    allLabels.push(...labels.map(l => prefix ? `${prefix} — ${l}` : l));
  }
}
```

### Also fix: single-product multi-job path (~lines 1408-1440)
The same issue exists for single product with multiple models/poses/ratios. Apply the same label-building from key parts.

### Result
Images will be grouped by format sections like:
- **Product A — 1:1**
- **Product A — 4:5**
- **Product B — 1:1**
- **Product B — 4:5**

Each group renders in its own uniform grid — no mixed sizes, no white space.

