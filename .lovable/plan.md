## Safe fix: Lightbox flash on open and on arrow navigation

### What's happening today
In `src/components/app/ImageLightbox.tsx`:
- The full-resolution image is the only thing rendered. While it downloads, `opacity-0` shows a blank dark area, then it pops in (the "flash").
- `key={currentImage}` on the `<img>` forces a full unmount/remount on each navigation, so the browser cannot reuse any decoded data.
- The "previous slide stays mounted" logic only works after the first successful load; on the very first open (and after cache-miss arrow nav) there is nothing underneath, so the user sees a blank frame.
- Adjacent slides are not preloaded, so every arrow press starts a fresh network request.

### Fix (single file, fully isolated)
Edit only `src/components/app/ImageLightbox.tsx`. No prop, signature, or behavioral changes — pure visual smoothing.

1. **Add an instant low-res placeholder layer** behind the full-res image, using `getOptimizedUrl(currentImage, { quality: 60 })`.
   - This URL is already in the browser cache from the results grid (which uses the same call), so it appears instantly with zero network cost.
   - Strictly **quality-only** per `mem://style/image-optimization-no-crop` — never `width`, `height`, or `resize`. No zoom regression possible.
   - Same `object-contain` and same max-height classes → identical framing.
   - Wrapped in a guard: if `getOptimizedUrl` returns the original URL unchanged (non-Supabase URL, blob, data URI), we simply skip rendering the placeholder layer to avoid double-loading the full-res file.

2. **Remove `key={currentImage}`** from the full-res `<img>`.
   - Lets React reuse the element and lets the browser swap `src` in place instead of re-mounting.
   - `onLoad` + `loadedSrc` state already handles the crossfade correctly without the key.

3. **Initialize `prevSrcRef` on first open** so the very first slide also has something underneath while loading (will be the low-res placeholder of the same image — clean fade, no blank).

4. **Preload neighbors** via a small `useEffect` that creates two `new Image()` objects for `images[currentIndex - 1]` and `images[currentIndex + 1]` (with wrap-around). Browser caches them; arrow nav becomes near-instant. No DOM, no layout, no state.

5. **Add `loading="eager"`** to the full-res `<img>` (it's the focal element) and keep `decoding="async"` and `fetchpriority="high"` as today.

### What is explicitly NOT changed
- No changes to `onNavigate`, `onSelect`, `onDownload`, `onRegenerate`, `onDelete`, `onCopyPrompt`, `onShare`, or any callback signature.
- No changes to keyboard handlers, body-scroll lock, portal mount, or close behavior.
- No changes to the action bar, mobile/desktop layouts, counter, or arrow buttons.
- No changes to any caller of `ImageLightbox` (Results, Library, Discover, etc.).
- No CSS sizing, `object-contain`, `max-h-*`, or aspect logic touched.
- No image transformation params beyond `quality` — guarantees no zoom/crop regression.

### Safety guarantees
- `getOptimizedUrl` safely no-ops on non-Supabase URLs → never breaks external/blob/data sources.
- If the placeholder fails to load, the full-res image still loads exactly as today (placeholder is purely additive, behind it).
- If `onLoad` never fires (slow network), the existing crossfade fallback (previous slide layer) still applies.
- Removing `key` is safe because the `<img>` has no internal state and React diffs `src` correctly.
- Preloading uses `new Image()` which is fire-and-forget; failures are silently ignored by the browser and don't affect rendering.

### Expected result
- Opening the lightbox: instant low-res preview (from cache), full-res crossfades in within ~100–400ms — no blank flash.
- Arrow navigation: previous slide stays visible, low-res of next slide appears instantly, full-res crossfades in. After one nav step, neighbors are preloaded so subsequent arrows are near-instant.
- Network tab: one extra `?quality=60` request per slide only if not already cached (usually it is).
- Functionality: identical to today.

### QA
1. Open Product Visuals → Step 6 → click any image → no blank flash on open.
2. Press arrow keys / click chevrons → smooth crossfade, no blank frame between slides.
3. Confirm framing is pixel-identical (no zoom shift) on both the placeholder and full-res layers.
4. Test with a non-Supabase URL (e.g., open an external image lightbox) → still works, no placeholder, no errors.
5. Confirm Select / Download / Regenerate / Delete / Copy Prompt / Share all still work and target the correct index.
