## Problem

After generating a video on **Animate Image**, **Start & End Video**, or the legacy **VideoGenerate** page, clicking **Download Video** does nothing and shows "Failed to download video". Users interpret this as "cannot save the video".

The `generated-videos` storage bucket is **private**. Three download handlers call `fetch(video_url)` against the raw stored URL with no signed token, so the request fails. `VideoDetailModal` (opened from Video Hub) already does this correctly via `toSignedUrl()` — that's why ZIP downloads and the lightbox download work, but the inline post-generation button does not.

Videos themselves **are** being saved to the user's library on completion (verified: last 10 `generated_videos` rows are `status='complete'` with `video_url` populated). The issue is purely the download UX.

## Fix

Use the existing `toSignedUrl()` helper (`src/lib/signedUrl.ts`) before fetching, exactly like `VideoDetailModal.handleDownload` does.

### 1. `src/components/app/video/VideoResultsPanel.tsx`
Replace the `handleDownload` body so it first resolves a signed URL:
- `import { toSignedUrl } from '@/lib/signedUrl';`
- `const signed = await toSignedUrl(videoUrl);`
- `const res = await fetch(signed);`
- Keep the existing blob → anchor click → `URL.revokeObjectURL` flow.
- On failure, show the same toast.

### 2. `src/pages/VideoGenerate.tsx` — `VideoHistoryCard.handleDownload`
Same change: sign `video.video_url` first, then fetch. Keep the "open in new tab" fallback (it still won't work for private URLs, but it's not regressing anything).

### 3. `src/pages/VideoGenerate.tsx` — main result `handleDownload`
Same change: sign `videoUrl` first, then fetch.

No backend, DB, RLS, or bucket changes. No new dependencies. Pure 3-file frontend patch.

## Verification

- AnimateVideo: generate a short video → click **Download Video** in the results panel → MP4 saves to disk.
- StartEndVideo: same flow.
- Video Hub → open detail modal → **Download Video** still works (already correct).
- Video Hub → **Download ZIP** still works (already correct).
- ShortFilm download still works (already correct).
