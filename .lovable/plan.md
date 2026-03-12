

## Hero Banner Image Loading Improvements

### Problems Identified

1. **No optimization for local images**: The first showcase uses local `/images/` paths. `getOptimizedUrl()` only transforms Supabase Storage URLs — local images pass through unchanged, loading as full-size uncompressed PNGs (likely 1-3MB each). This is why the hero feels laggy.

2. **Preloads ALL 24+ images on mount**: The `useEffect` preloads every image across all 3 showcase scenes simultaneously, competing for bandwidth with the visible first scene.

3. **ShimmerImage is already used** — so shimmer placeholders do work, but the massive unoptimized file sizes make the shimmer last too long.

### Changes

**File: `src/components/landing/HeroSection.tsx`**

1. **Rename "Cropped Tee" → "White Crop Top"** (line 26) and update caption (line 37) from "Same tee" to "Same top"

2. **Reorder first showcase outputs** (lines 27-35) to: Studio Lookbook → Golden Hour → Café Lifestyle → then the rest

3. **Only preload active scene eagerly, defer others** (lines 141-149): Preload scene 0 images immediately, preload other scenes after a 3-second delay so they don't block initial rendering

4. **Add `<link rel="preload">` for the hero product image**: Inject a preload link in a useEffect for the first product image (`/images/source-crop-top.jpg`) so the browser starts fetching it before React even renders the `<img>` tag — this is the single biggest LCP win

5. **Add explicit `width`/`height` attributes** to ShimmerImage calls for the product card (200×267) and output cards (180×240) to prevent layout shift and help the browser allocate space immediately

### New output order for first showcase
```text
1. Studio Lookbook
2. Golden Hour  
3. Café Lifestyle
4. Garden Editorial
5. Basketball Court
6. Urban Edge
7. Pilates Studio
8. Studio Portrait
```

