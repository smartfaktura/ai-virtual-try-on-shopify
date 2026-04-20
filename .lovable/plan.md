
## Step 6 results: previews load full-resolution (slow)

### What I found
In `ProductImagesStep6Results.tsx`, grid thumbnails use:
```tsx
<ShimmerImage src={img.url} ... />
```
That's the **raw, full-size 2K PNG** (each ~3-6 MB). With 52 images, the browser is downloading **150-300 MB** before tiles fill in — exactly what your screenshot shows (mostly blank shimmers).

By contrast, `JobDetailModal` and most other grids in the app already wrap thumbnails with `getOptimizedUrl(url, { quality: 60 })`, which routes through Supabase's render endpoint (~50-150 KB per tile).

The lightbox correctly shows the original full-res `img.url` — that part is fine.

### Fix
In `src/components/app/product-images/ProductImagesStep6Results.tsx`:

1. **Grid thumbnails** — wrap with `getOptimizedUrl`:
   ```tsx
   <ShimmerImage
     src={getOptimizedUrl(img.url, { quality: 65 })}
     ...
   />
   ```
   Quality only — no `width` param (per memory rule: width causes server-side crop zoom on full-bleed images).

2. **Eager-load the first row** (first 4 images) so they appear instantly:
   ```tsx
   loading={i < 4 ? 'eager' : 'lazy'}
   fetchPriority={i < 4 ? 'high' : 'auto'}
   ```

3. **Lightbox** stays untouched — still opens the original full-resolution URL when user clicks.

### File
- `src/components/app/product-images/ProductImagesStep6Results.tsx` (import `getOptimizedUrl`, update `<ShimmerImage>` props in the grid loop)

### Validation
1. Generate visuals → Step 6 grid fills within ~1-2s instead of 20-60s
2. Click any tile → lightbox shows full-res original (unchanged)
3. "Download All" / per-image download still pulls original quality (uses `img.url`, not the optimized URL)
