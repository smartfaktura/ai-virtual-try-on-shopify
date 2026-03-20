

# Fix Progress Banner Text, Results UI, and Toast Noise

## Issues from Screenshots
1. Banner says "Generating 0 jobs for 2 products" / "2 of 32 jobs done" — should say **images**, not jobs
2. Toast "Queued 32 generations for 2 products" is unnecessary noise — remove it
3. Est. time 6-11 min is too high — reduce per-image estimate from 15s to ~8s for 3-7 min range
4. Results page shows a huge "VARIATIONS" section with 32 badges — remove it entirely
5. Images are too large in results grid — use smaller thumbnails (5-6 columns)
6. Images are separated into groups by label — show all in one flat grid instead

## Changes

### 1. MultiProductProgressBanner.tsx — Fix text + time estimate
- Replace "jobs" with "images" everywhere: "2 of 32 images done", "Generating 32 images for 2 products"
- Change `estimatePerImage` from 15 to 8 seconds (gives ~3-7 min for 32 images)

### 2. Generate.tsx — Remove toast noise
- Remove the 4 `toast.success("Queued ...")` calls (lines ~1016, ~1180, ~1353, ~1462)

### 3. Generate.tsx — Remove VARIATIONS section in results
- Remove the "Variation labels" block (lines ~3996-4006) that renders all those badges

### 4. Generate.tsx — Flat grid with smaller thumbnails, no grouping
- Remove the grouped rendering path (lines ~4042-4077) that splits images by label
- Always use flat grid with more columns: `grid-cols-3 md:grid-cols-5 lg:grid-cols-6`
- This makes thumbnails smaller — user clicks to enlarge via lightbox

### Files to edit
- `src/components/app/MultiProductProgressBanner.tsx`
- `src/pages/Generate.tsx`

