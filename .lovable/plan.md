

# Fix Bulk Video Generation Progress UX

## Problem
When generating 10 videos in bulk mode, the single-video pipeline UI (`isPipelineActive` section) flashes on/off for each image as `runAnimatePipeline` cycles through analyze → build → generate stages per image. The bulk progress banner exists but the single-video progress card keeps interfering, causing chaotic flashing. There's no smooth "X of 10 queued" progress experience.

## Root Cause
`isPipelineActive` is derived from the single-video `useVideoProject()` state. During bulk, each sequential `runAnimatePipeline()` call toggles this state, making the single-video progress card (lines 1351-1411) flash on/off repeatedly while the bulk banner sits below.

## Changes

### 1. `src/pages/video/AnimateVideo.tsx`
- **Hide single-video progress during bulk**: Change line 1351 condition from `isPipelineActive` to `isPipelineActive && !isBulkRunning` — prevents the single-video takeover card from showing during bulk runs
- This single change eliminates all flashing

### 2. `src/components/app/video/BulkProgressBanner.tsx`
Enhance the banner to be a proper full-screen takeover experience (matching the single-video progress card style):
- Add rotating team avatar + "VOVV.AI Studio" branding header (reuse `TEAM_MEMBERS` pattern from single-video progress)
- Show "Queueing 3 of 10 videos…" as the main heading with a sub-message
- Add elapsed timer
- Add estimated time remaining (using ~15s per video queue submission)
- Keep the image thumbnail grid with status icons
- When complete: show "All 10 videos queued — they'll process automatically" with "View in Video Hub" button

### Files
- **Update**: `src/pages/video/AnimateVideo.tsx` — add `!isBulkRunning` guard to pipeline active UI
- **Update**: `src/components/app/video/BulkProgressBanner.tsx` — redesign as branded takeover card with progress details

