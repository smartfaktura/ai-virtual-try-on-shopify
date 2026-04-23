

## Fix zoomed-in thumbnails on `/app/admin/scene-performance`

### What broke

The previous optimization added `width: 80` to the Supabase image transformer for both the main table thumbnails (40×40 square) and the risers rail (28×28 square).

Scene preview images are **4:5 portrait**. When the transformer returns an 80px-wide image, it's 80×100. The CSS container is square (`w-10 h-10` / `w-7 h-7`) with `object-cover`, which then **crops the center of the portrait image** — making thumbnails look zoomed in or like solid color blocks (we're seeing the middle slice of the scene, not the whole composition).

This is exactly the failure mode documented in the project's `image-optimization-no-crop` memory: width param on non-matching aspect ratios causes a "crop zoom" effect.

### Fix (one file, frontend-only)

`src/pages/admin/SceneUsage.tsx` — restore the visual preview while keeping the file-size win:

1. **Switch the table thumbnails to 4:5 containers** that match the source aspect:
   - Change `w-10 h-10` → `w-8 h-10` (32×40)
   - Keep `object-cover` (now no cropping because aspect matches)
   - Keep `getOptimizedUrl(url, { width: 80, quality: 60 })` — 80px width covers retina for a 32px display tile, returns ~10–20 KB

2. **Same fix for the risers rail**:
   - Change `w-7 h-7` → `w-7 h-9` (28×36, ~4:5)
   - Keep optimized URL with `width: 80`

3. **Match the empty-state placeholder divs** to the new dimensions so layout stays stable while loading.

### Why this works

- Source aspect (4:5) now matches container aspect (4:5) → no crop, full scene visible
- `width: 80` still drops payload from ~2 MB to ~10–20 KB per tile
- No DB / RPC / RLS changes
- Doesn't violate the `image-optimization-no-crop` rule because container aspect now matches the requested transform aspect
- Trivial rollback

### Validation

1. Reload `/app/admin/scene-performance` → table thumbnails show full scene composition (not a zoomed center crop)
2. Risers rail thumbnails also show the full preview
3. Network panel still shows ~10–20 KB per thumbnail (not 2 MB)
4. KPIs, sort, search, "Load more", CSV — all unchanged

### File

- `src/pages/admin/SceneUsage.tsx` — adjust two `<img>` container classes + matching empty-state divs

