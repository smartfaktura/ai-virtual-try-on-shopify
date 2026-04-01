

# Fix Video Hub Grid: Fill-Frame Thumbnails + Lightweight Video Previews

## Problems
1. **Thumbnails too small** — the `object-contain` + `getMediaFrameStyle` approach leaves images floating tiny inside 3:4 cards with blurred backgrounds (second screenshot). Should fill the card like the original (first screenshot).
2. **Hover video too slow** — loading the full 20MB video on hover with `preload="none"` means users wait several seconds before anything plays. No good middle ground with the current approach.

## Solution

### Part 1: Restore fill-frame thumbnails (VideoHub.tsx)

Revert the inner media frame back to a simple full-card layout:
- Remove `getMediaFrameStyle` helper and `displayAspectRatio` logic
- Change both `<img>` and `<video>` from `object-contain` back to `object-cover`
- Keep the blurred background layer as-is (it's a nice touch)
- Keep `{ width: 800, quality: 60 }` optimization — at 800px it won't look zoomed on retina

This restores the original edge-to-edge card appearance from the first screenshot.

### Part 2: Generate lightweight video previews (backend + DB + UI)

This is how platforms like Instagram and TikTok handle it — store a small, compressed preview alongside the full video.

**Database migration:**
- Add `preview_url TEXT` column to `generated_videos` table

**Edge function update (`generate-video/index.ts`):**
- When Kling returns the completed video, after uploading the full-res file to storage, generate a low-quality preview:
  - Use Kling's video result which often provides a thumbnail/cover image
  - Store the **first frame** or **cover image** from the Kling API response as `preview_url` (Kling API returns `works[].cover_image_url`)
  - This is a static image from the actual video output (not the source image), so it accurately represents the generated result

**UI update (`VideoHub.tsx`):**
- For the grid thumbnail: prefer `video.preview_url` (the Kling cover frame) over `video.source_image_url` when available
- This shows what the video actually looks like, not just the input image
- On hover/click, load the full video in the detail modal instead of inline

### Part 3: Remove inline hover video playback

The hover-to-play pattern doesn't work well with 20MB files regardless of preload strategy. Instead:
- Remove the inline `<video>` element from `RecentVideoCard` entirely
- On hover, just show a subtle play icon overlay (already exists)
- Clicking opens the `VideoDetailModal` which streams the full video — this is expected behavior and the user is committed to watching at that point

## Files to modify
1. **`src/pages/VideoHub.tsx`** — Restore `object-cover`, remove `getMediaFrameStyle`, remove inline hover video, prefer `preview_url` for thumbnail
2. **`supabase/functions/generate-video/index.ts`** — Extract and store `cover_image_url` from Kling API response as `preview_url`
3. **Database migration** — Add `preview_url` column to `generated_videos`

## Technical notes
- The Kling API response includes `works[].cover_image_url` — a server-rendered cover frame. We download and re-upload it to our storage for CDN optimization.
- Existing videos without `preview_url` gracefully fall back to `source_image_url` (current behavior).
- No ffmpeg or video transcoding needed — we leverage what Kling already provides.

