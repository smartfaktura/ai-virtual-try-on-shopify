

## Fix Two Loading Bars & Multi-Product Results Display

### Problem 1: Two Progress Bars During Generation

During multi-product workflow generation, two separate progress sections are rendered simultaneously:
- **Lines 3049-3085**: Multi-product progress (product thumbnails, product X of Y counter, overall progress bar)
- **Lines 3087-3107**: Batch progress (image X of Y counter, another progress bar, QueuePositionIndicator)

This creates a confusing UX with two stacked loading indicators.

**Fix**: Merge them into a single unified progress section. When in multi-product mode, embed the QueuePositionIndicator and batch image count *inside* the multi-product progress block instead of showing a separate batch section below it. Hide the separate batch progress block when `isMultiProductMode` is true.

Specifically:
- In the multi-product section (3049-3085), after the thumbnail chips, add the QueuePositionIndicator and batch image counter
- Change the batch progress condition (line 3088) to: `{batchState && batchState.totalJobs > 1 && !isMultiProductMode && (...)}` 
- Change the single job condition (line 3110) to also exclude multi-product mode

### Problem 2: Results Page Only Shows One Product

When multi-product generation completes, the results summary card (lines 3138-3193) only shows a single product thumbnail (the last `selectedProduct`). It should show ALL products from the queue.

**Fix**: When `isMultiProductMode && productQueue.length > 1`, show all products from `productQueue` as reference thumbnails instead of just the single `selectedProduct`. Replace the single product thumbnail block with a loop over `productQueue`.

In the reference thumbnails section (lines 3139-3158), add a condition for multi-product mode:
```tsx
{isMultiProductMode && productQueue.length > 1 ? (
  productQueue.map(p => (
    <div key={p.id} className="flex-shrink-0 text-center">
      <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted/30">
        <img src={p.images[0]?.url || '/placeholder.svg'} alt={p.title} className="w-full h-full object-cover" />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 max-w-[56px] truncate">Product</p>
      <p className="text-[10px] font-medium mt-0.5 max-w-[56px] truncate">{p.title}</p>
    </div>
  ))
) : isFlatLay && selectedFlatLayProductIds.size > 1 ? (
  // ... existing flat lay logic
```

### Files changed — 1
- `src/pages/Generate.tsx` — Merge dual progress bars into one; show all products in results summary

