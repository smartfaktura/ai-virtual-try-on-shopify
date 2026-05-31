# Fix broken upscale thumbnails (lazy preview, full-size on click/download)

## What's broken

Screenshot shows two upscale tiles rendering with only the alt text "Upscaled 1" / "Upscaled 2"; only one image actually loaded. Root cause: the upscale-worker writes Topaz output to `freestyle-images/upscaled/...` as a 4K PNG. These files can easily exceed Supabase's `/render/image/` input size limit (~25 MB), so the optimized URL returns an error and the `<img>` fails. Tiles also have no lazy loading, so the browser tries to fetch all of them at once.

## Fix (all in `src/pages/Generate.tsx`, upscale grid around line 4784–4796)

### 1. Constrain tile size + lazy-load

Wrap the upscale `ShimmerImage` in a fixed-ratio container (`aspect-[4/5]`) with `object-cover` so each tile renders a small consistent preview window rather than streaming the full image. Pass `loading="lazy"` so off-screen tiles defer their fetch. Keep `items-start` on the grid for non-upscale parity.

### 2. Try optimized URL first, fall back to original on error

`getOptimizedUrl(url, { quality: 70 })` is the preferred path (small JPEG re-encode). When the render endpoint chokes on a large PNG, `ShimmerImage`'s `onError` fires — swap the `src` to the raw `url` so the tile still paints. Implement with a small local `<UpscaleTile>` component that holds `useState(optimizedUrl)` and on error sets it to the original.

### 3. Keep full-size for lightbox & download

The lightbox open (`handleImageClick`) and per-image / "Download All" actions already use the original `url` array — no change. Users always get the full 4K asset when they click.

## Why not server-side resize

Generating a real smaller preview at upscale-worker time would require an extra render+upload per job and a new column to store the preview URL. Out of scope for a UI fix; the lazy + fallback pattern matches what the rest of the app does and removes the bandwidth + reliability problem.

## Out of scope

- No worker changes, no schema changes
- Non-upscale results grid untouched
- Lightbox, download, ZIP behaviour untouched
