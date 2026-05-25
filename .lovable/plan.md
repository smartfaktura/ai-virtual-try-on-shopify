# Fix video download for generated videos

## Problem

After generating a video, clicking **Download** opens the video in a new browser tab instead of saving it as an `.mp4` file. Users have to right-click → "Save video as…" to keep it.

## Root cause

Two download buttons in `src/pages/VideoGenerate.tsx` use a plain anchor with the `download` attribute pointing at the video URL:

```ts
const a = document.createElement('a');
a.href = video.video_url;
a.download = 'video-xxx.mp4';
a.target = '_blank';
a.click();
```

Browsers **ignore the `download` attribute when the URL is cross-origin** (Kling CDN, and Supabase Storage on a different origin than the app). Result: the link behaves like a normal navigation and the video streams inline in a new tab.

The Short Film page already does this correctly by fetching the URL as a blob first — we mirror that pattern.

## Audit of other download paths (no change needed)

| Surface | Status |
|---|---|
| Short Film single download (`src/pages/video/ShortFilm.tsx`) | OK — already uses `fetch → blob` with `window.open` fallback |
| Video Hub bulk ZIP (`src/pages/VideoHub.tsx` → `downloadVideosAsZip`) | OK — signed URL + JSZip blob |

## Changes

### `src/pages/VideoGenerate.tsx`

Rewrite both `handleDownload` functions (the post-generation Download button at ~line 228, and the History card download at ~line 26) to:

1. `fetch(video_url)` → `response.blob()`
2. `URL.createObjectURL(blob)` → assign to `<a>` → click → `revokeObjectURL`
3. On any error, `console.warn` and fall back to `window.open(video_url, '_blank')` so the user is never stuck.
4. Keep existing filename logic (`video-${camera_type||id}.mp4`).

No other files, no backend, no DB, no new dependency.

## Risk

Very low. Worst case is identical to today's behavior (video opens in a new tab via the fallback). The `fetch → blob` pattern is already proven in `ShortFilm.tsx` against the same Kling CDN.

## Verification

- Generate a video in `/app/video` and click **Download** → browser save dialog appears, file lands as `.mp4`.
- Click **Download** on a history card → same.
- Force the fetch to fail (e.g. offline) → falls back to opening in a new tab without throwing.
