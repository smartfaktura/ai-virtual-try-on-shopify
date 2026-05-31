# Optimize upscale results grid thumbnails

## Problem

On `/app/generate/image-upscaling`, the results grid renders each upscaled image with `<ShimmerImage src={url} … />` where `url` is the raw storage URL of the Topaz output. That output is a full 4K (or 2K) PNG — often 5–15 MB each — and the browser downloads the entire file just to paint a tile that's roughly 360 px wide. With 3+ results this can be 30–50 MB of unnecessary transfer and slow first paint.

The non-upscale grid has the same pattern but the outputs there are much smaller, so the cost is mostly felt on the upscale page.

## Fix

In `src/pages/Generate.tsx` (results grid around line 4784–4796), wrap the tile `src` with `getOptimizedUrl(url, { quality: 70 })` from `src/lib/imageOptimization.ts`.

- Quality-only transform (no `width=`) — per project rule, passing `width` without `height` to Supabase's render endpoint causes a server-side crop zoom. Quality-only re-encodes to a smaller JPEG/WebP while preserving the full image and aspect ratio, which is what we want for a variable-aspect grid.
- Only apply to the tile `<ShimmerImage>` source. Leave untouched:
  - The lightbox view (`handleImageClick`) — must stay full resolution
  - The per-image Download button (`handleDownloadImage`) — must download the full Topaz output
  - The "Download All" ZIP path — must zip the originals
- `getOptimizedUrl` is a no-op for non-Supabase URLs and for URLs already routed through `/render/image/`, so it's safe for both upscale and normal generation results. Apply the same wrapper to both branches of the grid (one line change covers both since they share the same `<ShimmerImage>` element).

## Out of scope

- No backend or worker changes (Topaz pipeline stays as-is)
- No change to lightbox, download, or ZIP behavior
- No change to the source/product picker thumbnails on the same page
