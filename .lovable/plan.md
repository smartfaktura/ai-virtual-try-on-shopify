

## Fix: Scene 0 Images Loading 10-20x Slower Than Others

### Root Cause

Scene 0 (White Crop Top) images use **local paths** (`/images/try-showcase/studio-lookbook.png`), while Scenes 1-2 (Face Serum, Gold Ring) use **Supabase Storage** via `h('hero-serum-studio.jpg')`.

The `optimizeOutput()` function calls `getOptimizedUrl()`, which **only transforms Supabase Storage URLs**. Local `/images/...` paths are returned **unchanged** — meaning:
- Scene 0: Full-resolution `.png` files served raw (likely 2-5MB each)
- Scenes 1-2: Optimized via Supabase render endpoint at `quality=70` (typically 50-150KB each)

This explains why Café Lifestyle and Garden Editorial appear faster — they're further right in the carousel so the browser loads them after the first two have started, but the real issue is that **all 8 scene-0 images are unoptimized PNGs**.

Additionally, the `<link rel="preload">` in `index.html` points to `hero-product-tshirt.jpg` (a Supabase asset that's no longer the active product image), so the preload is wasted.

### Fix — Migrate Scene 0 to Supabase Storage

**1. Upload scene 0 images to the `landing-assets` bucket** under `hero/` (same pattern as scenes 1-2). The 8 output images + 1 product image need to be uploaded.

**2. Update `src/components/landing/HeroSection.tsx`** — Change scene 0 to use `h()` helper:
```tsx
{
  product: { img: h('hero-product-croptop.jpg'), label: 'White Crop Top', subtitle: '1 product photo' },
  outputs: [
    { img: h('hero-croptop-studio-lookbook.jpg'), label: 'Studio Lookbook' },
    { img: h('hero-croptop-golden-hour.jpg'), label: 'Golden Hour' },
    // ... etc
  ],
}
```

**3. Update `index.html`** — Fix the preload to match the actual first product image URL.

### Expected Result
- All images go through `getOptimizedUrl` → served at `quality=70` via Supabase's image transformation CDN
- Load times drop from 10-20s to under 2s (matching scenes 1-2)
- Consistent rendering behavior across all 3 scenes

### Prerequisite
The 9 images from `public/images/try-showcase/` and `public/images/source-crop-top.jpg` need to be uploaded to the `landing-assets` storage bucket first. I can handle the upload and code changes together.

