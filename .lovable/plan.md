

# Fix: Flash of Incorrect Category on Step 2

## The Problem

When moving from Step 1 to Step 2, `analyzeProducts()` is triggered asynchronously. The Step 2 scene grid renders immediately using whatever partial data is available — if `analysis_json` is empty and the keyword fallback matches the wrong category, the user sees incorrect scenes for 1-2 seconds until the AI analysis completes and the correct category appears.

## The Fix

**File: `src/pages/ProductImages.tsx`** (~5 lines)

When `isAnalyzing` is true on Step 2, show a skeleton/loading state instead of immediately rendering the scene grid with potentially wrong data. This prevents the flash of incorrect content:

```text
step === 2 && isAnalyzing && selectedProducts have no cached analysis
  → show skeleton placeholder ("Analyzing your product…")
step === 2 && !isAnalyzing (or all products have cached analyses)
  → show scene grid normally
```

Specifically:
- Before the `<ProductImagesStep2Scenes>` render, check if any selected product is still in `pendingIds` AND has no `analysis_json` cached
- If so, render a branded loading state: product thumbnail + "Analyzing product…" spinner + skeleton grid
- Once analysis completes, the component re-renders with correct category data

This is a minimal change — just wrap the Step 2 render with a loading guard.

## Files Changed

1. **`src/pages/ProductImages.tsx`** — add loading guard before Step 2 scene grid when analysis is pending for uncached products

