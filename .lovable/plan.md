# Fix mobile video loading on bags · swimwear · activewear · eyewear

The issue is in the shared video behavior for the new category landing pages: mobile shows the poster / first frame, but the `<video>` is not always forced to load and play after it enters the viewport. The fix should make the hero video tile and the 6-up motion section start reliably on mobile without changing the page design.

## What I will change

### 1. Hero video tile: `CategoryHero.tsx`
- Keep the existing poster image underneath the video.
- Add a small ref-based mobile-safe autoplay routine for hero collage videos:
  - call `video.load()` once the tile mounts
  - call `video.play()` after mount and again on `loadedmetadata`, `loadeddata`, `canplay`, and `playing`
  - keep `muted`, `playsInline`, `loop`, `autoPlay`, `preload="auto"`, and `disableRemotePlayback`
- Mark the video as visible once it can actually render (`loadeddata` / `canplay` / `playing`), not only one narrow event.

### 2. Motion strip videos: `CategoryMotionShowcase.tsx`
- Stop relying on `preload="metadata"` + `onLoadedData` alone, because mobile browsers may only fetch metadata and never decode enough to fire the current ready state.
- Add `autoPlay` and switch active near-viewport clips to `preload="auto"`.
- When a tile becomes eligible to load, explicitly call `load()` and `play()` through the video ref.
- Retry `play()` on `loadedmetadata`, `loadeddata`, `canplay`, and `playing` so mobile autoplay recovers even when the first attempt is ignored.
- Use the poster as fallback only until video readiness, then fade the moving video in as before.

### 3. Save-data behavior
- Keep `prefers-reduced-motion` respected.
- Do not fully disable videos only because `navigator.connection.saveData` is set; instead, still allow the visible/near-visible videos to load so users are not left with a stuck frame.

### 4. Verification
- Check mobile viewport on `/ai-product-photography/swimwear` and confirm the hero video tile advances past `currentTime: 0`.
- Scroll to the motion section and confirm visible motion clips load/play instead of staying as static posters.
- Because bags, activewear, and eyewear use the same shared components, the same fix applies to all four pages.

## Out of scope

- No layout redesign.
- No copy changes.
- No new assets or video replacement.
- No changes to feed images, scene grids, FAQ, SEO text, or unrelated pages.
