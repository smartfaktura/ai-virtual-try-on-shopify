
Fix the Video Hub thumbnails by matching the card frame to the actual media ratio instead of forcing everything into `aspect-[3/4]`.

1. Update `src/pages/VideoHub.tsx`
- Replace the raw `<img>` thumbnail with the app’s standard `ShimmerImage` pattern.
- Stop using a fixed `aspect-[3/4]` wrapper for every video card.
- Make each card ratio-aware:
  - Processing / queued cards: use the original source image’s real aspect ratio.
  - Completed cards: use the preview image’s real aspect ratio when available, otherwise fall back to the saved video aspect ratio.
- Keep `object-cover`, but only after the wrapper ratio matches the media ratio. That gives “fills the frame” without the current crop/zoom problem.
- Remove the Video Hub-specific `width: 800` override and use the same optimization style used elsewhere in the app: `getOptimizedUrl(url, { quality: 60 })`.

2. Update `src/hooks/useGenerateVideo.ts`
- Add `preview_url` to the `GeneratedVideo` shape instead of using `(video as any)`.
- Sign `preview_url` the same way `video_url` and `source_image_url` are signed, so the grid always receives a valid thumbnail URL.
- Keep existing fallback behavior: `preview_url -> source_image_url`.

3. Add lightweight ratio detection in the Video Hub
- Read image natural width/height on load and cache the computed aspect ratio per card.
- Use that cached ratio to render the thumbnail wrapper with the correct `aspect-ratio`.
- Start with a safe fallback ratio until the image metadata is known, then update the card once loaded.

4. Keep the current lightweight preview strategy
- Do not preload full videos in the grid.
- Keep using static preview images for cards and full video playback only in the modal.

Technical details
- The current zoom issue is not mainly the optimizer itself; it is the combination of:
  - fixed `3:4` card frames
  - `object-cover`
  - thumbnails whose real ratio is not `3:4`
- Best-practice references already in this app:
  - `RecentCreationsGallery.tsx`
  - `LibraryImageCard.tsx`
  - `shimmer-image.tsx`
- No new backend or database change is needed for this fix. The preview pipeline already exists; the frontend just needs to render it using the correct ratio and signed URL handling.

Files to update
- `src/pages/VideoHub.tsx`
- `src/hooks/useGenerateVideo.ts`

Validation
- Check one processing card with a non-3:4 source image.
- Check completed cards with `preview_url`.
- Check old completed cards without `preview_url`.
- Confirm cards still look sharp and no longer appear zoomed/cropped.
