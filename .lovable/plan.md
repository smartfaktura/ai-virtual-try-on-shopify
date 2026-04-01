

# Fix Video Detail Modal Layout + Investigate Kling Aspect Ratio

## Finding: Kling API Ignores aspect_ratio for image2video

From the Kling 3.0 docs: **"When you provide image_urls (first and/or last frame images), the aspect_ratio parameter becomes optional. The system will automatically adapt the aspect ratio based on the uploaded images."**

This means for image-to-video, Kling always outputs the same aspect ratio as the source image. A 3:4 portrait source image produces a 3:4 video regardless of what `aspect_ratio` value we send. The `aspect_ratio` parameter only applies to text-to-video.

**Impact:** The aspect ratio selector in Animate Video settings is misleading for image-to-video workflows. We have two options:
1. Hide/disable the aspect ratio selector for image-to-video (since it has no effect)
2. Pre-process the source image (crop/pad) to match the selected aspect ratio before sending to Kling

I recommend **option 1** for now (honest UX) with a note explaining the output matches the source image.

## Changes

### 1. VideoDetailModal — Move actions above details (mobile-first)

Reorder the right panel so Download + Delete appear immediately after the date/status header, before the details grid. On mobile this means users can act without scrolling past 12 metadata rows.

```
Header (title + date)
  ↓
Actions (Download + Delete)
  ↓
Details grid (Duration, Format, Resolution, etc.)
```

### 2. VideoDetailModal — Fix format display

The format currently shows `video.aspect_ratio` from the DB which is what we *requested* (16:9), not what Kling actually produced. Since we already read real dimensions via `onLoadedMetadata`, we should:
- Always prefer the actual video metadata when available
- Show the requested ratio with a "(requested)" note if it differs from actual

### 3. Animate Video settings — Clarify aspect ratio behavior

In the aspect ratio selector, add an info note: "Output matches your source image ratio" and either disable the selector or make it informational-only for image-to-video mode.

### 4. Fix DB stored aspect_ratio

Stop saving the user-selected `aspect_ratio` to the `generated_videos` row for image2video, since it's inaccurate. Instead, when the video completes and we get `onLoadedMetadata` dimensions, we could update the DB — but simpler: just don't display the DB value when real metadata is available (already partially done).

## Files to modify

1. **`src/components/app/video/VideoDetailModal.tsx`** — Reorder: actions before details
2. **`src/pages/video/AnimateVideo.tsx`** — Add note on aspect ratio selector explaining output matches source image
3. **`supabase/functions/generate-video/index.ts`** — Remove `aspect_ratio` from Kling request body for image2video (it's ignored anyway), prevents confusion in logs

