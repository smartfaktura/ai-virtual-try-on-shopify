

# Fix Bulk Video Generation UX — Single Loading Screen

## Problems

1. **`/app/video-hub` route is 404** — `BulkProgressBanner` navigates to `/app/video-hub` but the actual route is `/app/video`
2. **Multi-motion single image (lines 394-415)** calls `resetPipeline()` between each camera motion, causing multiple flash screens and toasts — needs to use the bulk pipeline instead
3. **BulkProgressBanner** shows "Queueing X of Y" (enqueue progress) but not the actual video generation progress with estimated/elapsed time in VOVV.AI branded style as requested

## Changes

### 1. `src/components/app/video/BulkProgressBanner.tsx` — Fix route + improve progress UX

- Fix navigation: `/app/video-hub` → `/app/video`
- Add two-phase display:
  - **Phase 1 (enqueuing)**: Current "Queueing X of Y videos..." with progress bar
  - **Phase 2 (processing)**: After all queued, show "X of Y videos generating" with estimated time (use ~90s per video constant), elapsed timer, and rotating VOVV.AI team avatars
- Show "Estimated time: ~Xm" based on total videos × 90s
- Show elapsed time counter throughout

### 2. `src/pages/video/AnimateVideo.tsx` — Multi-motion uses bulk pipeline

- Refactor the single-image multi-motion path (lines 394-415) to use `runBulkAnimatePipeline` instead of looping `resetPipeline()` + `runAnimatePipeline()`
- This converts the single image + N camera motions into N bulk items, all enqueued as a single batch with one loading screen
- Remove the `resetPipeline()` / `await delay(300)` loop

### Files
- **Update**: `src/components/app/video/BulkProgressBanner.tsx`
- **Update**: `src/pages/video/AnimateVideo.tsx`

