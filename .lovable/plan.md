

# Separate Processing vs Completed Videos, Fix Toasts, Add Aspect Ratio Icons

## Issues Identified

1. **Processing and completed videos mixed together** — the Video Hub shows all videos in one grid, making it hard to track active work vs finished results.
2. **Noisy recovery toast** — `"X video(s) updated from processing"` fires on every mount. With many videos, this is disruptive. Should be silent or summary-only.
3. **Aspect ratio shows as square despite 16:9 selection** — The code correctly passes `aspect_ratio: "16:9"` all the way to the Kling API. This is likely a provider-side behavior where image2video output matches the source image dimensions rather than the requested ratio. We cannot force this from our side, but we can add a note/log to help debug. We'll verify the DB record to confirm the value was stored correctly.
4. **Aspect ratio buttons lack visual icons** — currently just text labels "9:16", "1:1", "16:9" with no visual indicator of orientation.

## Changes

### 1. `src/pages/VideoHub.tsx` — Split grid into Processing and Completed sections

- Filter `history` into two arrays: `processingVideos` (status = `processing` | `queued`) and `completedVideos` (everything else).
- Show a "In Progress" section at the top with processing/queued videos, with an amber accent and pulse animation on the section header.
- Show "Completed Videos" section below with the count badge and Load More button.
- If no processing videos, hide that section entirely.

### 2. `src/hooks/useGenerateVideo.ts` — Silence recovery toast

- Change `recoverStuckVideos` to NOT show a toast. Recovery is a background housekeeping task — it should be completely silent. Just silently refresh history after recovery.
- Remove: `toast.info(\`${data.recovered} video(s) updated from processing\`);`

### 3. `src/pages/video/AnimateVideo.tsx` — Add orientation icons to aspect ratio buttons

- Update `ASPECT_RATIOS` to include a mini SVG/icon for each ratio:
  - **9:16** (vertical/portrait): tall rectangle icon
  - **1:1** (square): square icon
  - **16:9** (horizontal/landscape): wide rectangle icon
- Render each as a small inline SVG next to the label inside the button, like: `[icon] 9:16`
- Use simple bordered rectangles with different proportions (e.g., `w-3 h-5` for 9:16, `w-4 h-4` for 1:1, `w-5 h-3` for 16:9) styled as rounded-sm border elements.

### 4. Aspect ratio bug investigation

- The payload chain is verified: `aspectRatio` state -> `startGeneration(aspectRatio)` -> `payload.aspect_ratio` -> edge function `klingBody.aspect_ratio`. The value IS being sent to Kling correctly.
- Add a console.log in the edge function to explicitly log the aspect ratio being sent, so we can confirm via logs.
- If Kling ignores the ratio for image2video, that's provider behavior we can't override.

## Files to modify
- `src/pages/VideoHub.tsx` — split into processing/completed sections
- `src/hooks/useGenerateVideo.ts` — remove recovery toast
- `src/pages/video/AnimateVideo.tsx` — add aspect ratio mini icons
- `supabase/functions/generate-video/index.ts` — add aspect ratio debug log

