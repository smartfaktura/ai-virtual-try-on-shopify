

# Migrate Showcase Images to Storage & Optimize

## Summary
Upload 11 local JPG files from `/public/images/showcase/` to the `landing-assets` Supabase Storage bucket under `showcase/`, then update `ProductCategoryShowcase.tsx` so every image uses the `s()` helper (which applies `getOptimizedUrl` with quality: 60). Finally, delete the local files from `/public/images/showcase/`.

## Steps

### 1. Upload 11 images to storage
Upload each file to `landing-assets/showcase/` bucket, keeping the same filename but converting extension to `.jpg` (or keeping as-is):
- `fashion-activewear-track.jpg`
- `fashion-leopard-sneakers.jpg`
- `fashion-portrait-curls.jpg`
- `fashion-white-dress-stadium.jpg`
- `fashion-blonde-coat.jpg`
- `beauty-perfume-ice.jpg`
- `beauty-perfume-driftwood.jpg`
- `beauty-perfume-splash.jpg`
- `beauty-perfume-rocks.jpg`
- `beauty-perfume-aloe.jpg`
- `home-boucle-chair.jpg`

### 2. Update `ProductCategoryShowcase.tsx`
Replace all 11 direct `/images/showcase/...` paths with `s('filename.jpg')` calls, making every image go through the optimization pipeline. Example:

```ts
// Before
'/images/showcase/fashion-activewear-track.jpg',
// After
s('fashion-activewear-track.jpg'),
```

### 3. Delete local files
Remove the 11 JPGs from `/public/images/showcase/` to reduce bundle size. If the directory becomes empty, remove it entirely.

## Result
All 31 images in this section will be served from the CDN with on-the-fly quality optimization — consistent with the rest of the landing page.

