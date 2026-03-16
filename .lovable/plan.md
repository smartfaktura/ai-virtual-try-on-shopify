

## Replace Skincare showcase images

### What
Replace the 5 current skincare images in `ProductCategoryShowcase` with the 4 user-uploaded images. Images will be copied to `public/images/showcase/` and referenced directly. No `width` parameter will be used — just quality-only paths to avoid zoom/crop.

### Steps

1. **Copy 4 uploaded images** to `public/images/showcase/`:
   - `user-uploads://7e33fbd6-...` → `public/images/showcase/skincare-serum-model.png`
   - `user-uploads://7c6572e8-...` → `public/images/showcase/skincare-serum-marble.png`
   - `user-uploads://92b4c0b2-...` → `public/images/showcase/skincare-model-light.png`
   - `user-uploads://56795b90-...` → `public/images/showcase/skincare-perfume-vanity.png`

2. **Update `ProductCategoryShowcase.tsx`** — change the Skincare entry from 5 `s(...)` images to 4 direct `/images/showcase/...` paths:
   ```typescript
   {
     label: 'Skincare',
     images: [
       '/images/showcase/skincare-serum-model.png',
       '/images/showcase/skincare-serum-marble.png',
       '/images/showcase/skincare-model-light.png',
       '/images/showcase/skincare-perfume-vanity.png',
     ],
     cycleDuration: 8500,
   },
   ```

No `getOptimizedUrl` or `width` parameter involved — these are local assets served as-is, avoiding any server-side cropping.

