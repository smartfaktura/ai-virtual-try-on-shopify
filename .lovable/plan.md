# Fix motion video section loading on mobile (activewear / swimwear / bags)

## Problem

On the `/ai-product-photography/{activewear,swimwear,bags}` pages, the "Motion · … in movement" section renders empty skeleton tiles for many seconds on mobile. Diagnosis from a live mobile (390px) test:

- All 6 source clips are large (avg ~700 KB; swimwear ~1 MB each).
- First-byte for each clip is 1.4–2.3 s on the sandbox connection — real LTE is worse.
- The current `CategoryMotionShowcase` gates rendering on `loadStates[i]` (intersection) AND `readyStates[i]` (`onLoadedData`). Until both fire, the user sees only a gray skeleton with no image fallback.
- `preload="auto"` forces a full-body fetch per visible tile.
- `MAX_CONCURRENT = 2` + slot only released on `onPlaying` means the next 2 tiles wait until the first 2 actually start playing.

## Fix

Update only `src/components/seo/photography/category/CategoryMotionShowcase.tsx`. No other files change.

1. **Add poster fallback per clip** so users immediately see a still frame while the MP4 buffers. Generate one optimized JPG per video (24 total) and import them alongside the mp4s. Render the poster as a base layer (`<img>` with `loading="lazy"`, `decoding="async"`, `object-cover`) that stays visible until the `<video>` reaches `playing`. Skeleton shimmer fades out as soon as the poster is decoded, not when the video is ready.
2. **Switch `preload="auto"` → `preload="metadata"`** and remove the gating `loadStates[i]` skeleton-only state. Render the `<video>` element as soon as the tile is near the viewport so the browser can begin metadata + range fetches earlier.
3. **Raise `MAX_CONCURRENT` from 2 → 3** and release the slot on `onLoadedData` (first frame decoded) instead of `onPlaying`. This unblocks queued tiles when one is slow to reach playback.
4. **Hide tiles 5–6 on mobile** (already hidden `sm:block`) — keep, so mobile only loads 4 clips.
5. **Keep the `prefers-reduced-motion` / `saveData` degraded path**, but in that mode render the poster image instead of an empty skeleton.

## Technical details

- Posters: generate from each `*-motion-N.mp4` using ffmpeg at frame ~0.5s, scaled to 540px wide, mozjpeg q=72. Save as `src/assets/seo/{slug}-motion-{n}.jpg`. Import statically next to the mp4 imports.
- `CLIPS_BY_SLUG` becomes `{ video: string; poster: string }[]`.
- Markup order per tile:
  ```text
  <div tile>
    <div skeleton (fades on poster load) />
    <img poster (always present) />
    <video (preload=metadata, fades in on loadeddata) />
    <NEW badge (i === 0) />
  </div>
  ```
- Remove `onCanPlay` (no longer needed — autoplay attempts on `loadeddata`).
- Keep IntersectionObserver pause/play behavior unchanged.

## Out of scope

- No transcoding of the source mp4s (keeps current quality). Posters alone solve the perceived-loading issue.
- No changes to other landing pages, SEO copy, or the bags/swimwear/activewear page layout.
