

# Bulk Video Generation for Paid Users

## Summary

Add multi-image support to the Animate Image page. Paid users can upload multiple images, the first image gets analyzed, and they can choose to apply the same settings to all images. Each video is enqueued as a separate job in the existing queue — no backend changes needed.

## How It Works

1. **Upload phase**: Paid users see a multi-image upload zone (up to 10 images). Free users remain single-image only.
2. **Analysis**: First image is analyzed by AI to detect category, scene type, motion goals. Results pre-fill settings.
3. **Apply to all toggle**: A prominent "Apply same settings to all images" checkbox (default ON). If OFF, user can tab through images and tweak per-image settings (stretch goal — start with "apply to all" only).
4. **Credit estimate**: Shows total cost (e.g., "10 credits × 5 images = 50 credits") with balance check.
5. **Generate**: Loops through images, calling `runAnimatePipeline` for each. Jobs enter the existing queue sequentially with pacing delays.
6. **Progress**: A batch progress banner shows "Generating 3/5 videos" with individual status indicators.

## Technical Plan

### 1. New component: `BulkImageUploader.tsx`
- Grid of uploaded image thumbnails with add/remove
- Drag-and-drop or file picker for multiple files
- Shows analysis badge on the first image
- Paid-user gate check via `useCredits().plan`

### 2. Update `AnimateVideo.tsx`
- Add state: `bulkImages: Array<{ url, preview, analysisResult? }>`
- When `plan !== 'free'`, show bulk upload option
- "Apply same settings to all" toggle (default true)
- Update credit estimate to multiply by image count
- Generate button triggers sequential pipeline for each image
- Show batch progress UI during generation

### 3. Update `useVideoProject.ts`
- Add `runBulkAnimatePipeline(images[], sharedParams)` that loops through images, creating a project + enqueuing for each
- Uses pacing delay between enqueue calls (300ms via existing `paceDelay`)
- Tracks bulk progress: `{ total, completed, failed }`

### 4. Batch progress UI
- Reuse existing progress banner pattern from image generation
- Show per-image status (queued / generating / complete / failed)
- Link to Video Hub when all complete

### 5. Credit validation
- Upfront check: `estimateCredits(params) × imageCount <= balance`
- Block generation with clear message if insufficient

## What's NOT Changing
- No backend/edge function changes — each video is a standard single job
- No database schema changes — each video gets its own `video_projects` + `generated_videos` rows
- Queue system handles concurrency naturally
- Free users keep single-image behavior

## File Changes
- **New**: `src/components/app/video/BulkImageGrid.tsx` — multi-image upload grid
- **Update**: `src/pages/video/AnimateVideo.tsx` — bulk mode toggle + batch generation flow
- **Update**: `src/hooks/useVideoProject.ts` — `runBulkAnimatePipeline` method
- **Update**: `src/config/videoCreditPricing.ts` — add bulk estimate helper

