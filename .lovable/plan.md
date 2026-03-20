

# Fix: Loading State Not Showing Correct Image Count for Multi-Job Workflows

## Problem
When generating a **Selfie / UGC Set** (or any try-on/workflow) with a single product but multiple jobs (multiple models × scenes × ratios × framings), the loading screen only shows a single-job progress indicator ("Generating your images... Est. ~55-85 seconds") instead of showing the total number of images being generated (e.g., "5 of 8 images done").

This happens because `MultiProductProgressBanner` only renders when `isMultiProductMode` is true (`productQueue.length > 1`), but single-product multi-job combos also use `multiProductJobIds` for tracking.

## Root Cause
- Line 374: `isMultiProductMode = productQueue.length > 1` — only true for multi-product queues
- Line 3855: `{isMultiProductMode && !isFinalizingResults && (<MultiProductProgressBanner .../>)}` — banner hidden for single-product multi-job runs
- Lines 3926-3933: Falls through to single-job `QueuePositionIndicator` which shows no total count
- The subtitle (line 3834) only says `Dressing Freya in "Product"` — doesn't mention how many images total

## Changes — `src/pages/Generate.tsx`

### 1. Introduce `hasMultipleJobs` flag
Add a derived boolean: `const hasMultipleJobs = multiProductJobIds.size > 1;`
This is true whenever we have multiple enqueued jobs, regardless of whether it's multi-product or single-product-multi-combo.

### 2. Show `MultiProductProgressBanner` for all multi-job scenarios
Change the condition from `isMultiProductMode` to `hasMultipleJobs`:
```
{hasMultipleJobs && !isFinalizingResults && (
  <MultiProductProgressBanner ... />
)}
```

### 3. Hide the single-job and batch progress when `hasMultipleJobs`
Update the guards on the batch progress section and single-job section to also exclude `hasMultipleJobs`:
- Batch progress: `!isMultiProductMode` → `!hasMultipleJobs`
- Single job: `!isMultiProductMode` → `!hasMultipleJobs`

### 4. Fix the subtitle to show total image count for try-on multi-combos
Update the try-on subtitle from just `Dressing Freya in "Product"` to include the count when multiple jobs exist, e.g.:
`Dressing Freya in "Product" · 8 images across 2 models × 4 scenes`

### 5. Update `MultiProductProgressBanner` to handle single-product multi-job
The banner currently shows product chips — for single-product runs, skip product chips and show a simpler "X of Y images done" format. Pass a flag or detect from `productQueue.length === 1`.

## Files
- `src/pages/Generate.tsx` — condition changes and subtitle update
- `src/components/app/MultiProductProgressBanner.tsx` — handle single-product mode gracefully (hide product chips, show job-level progress)

