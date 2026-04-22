

## Fix zoomed thumbnails in Import Scenes modal

### The bug
The previous optimization pass added `width=96` / `width=120` to `getOptimizedUrl()` for the Import Scenes modal thumbnails. Supabase's `/render/image/` endpoint crops server-side when width is set without a matching height, producing the zoomed-in placeholder-looking thumbnails visible in the screenshot (Tennis Court, Urban Subway Ride, etc.).

This is exactly the case the `image-optimization-no-crop` core rule warns about.

### Fix
In `src/components/app/ImportFromScenesModal.tsx`, switch both thumbnail `getOptimizedUrl()` calls to **quality-only** optimization:

- Step 1 grid thumbnail: `getOptimizedUrl(url, { quality: 60 })` (drop `width: 96`)
- Step 2 review thumbnail: `getOptimizedUrl(url, { quality: 60 })` (drop `width: 120`)

Quality-only still routes through Supabase's render endpoint and re-encodes at 60% quality, which gives ~70–85% size savings vs the original PNG/JPEG without any cropping. Thumbnails will display the full scene composition again, just like before the optimization pass — but at a fraction of the bytes. `loading="lazy"` and `decoding="async"` stay in place.

### Files touched
- **Edit only** `src/components/app/ImportFromScenesModal.tsx` — remove `width` from the two `getOptimizedUrl` calls.

### Validation
- Open `/app/admin/product-image-scenes` → click **Import scenes** for any category.
- Thumbnails now show the full scene composition (Tennis Court shows the full court, Urban Subway shows the full carriage, etc.), not a zoomed crop.
- Network tab: requests still hit `/storage/v1/render/image/...?quality=60` and remain dramatically smaller than the original full-res files.

### Out of scope
No layout, lazy-loading, or data-fetching changes. No other modals touched. The `image-optimization-no-crop` rule remains the standard.

