**Problem**: On the final results screen of `/app/generate/product-images`, the per-product badge always says "N images" even when there's only 1 image.

**Fix**: In `src/components/app/product-images/ProductImagesStep6Results.tsx` line 120, change:
```
{images.length} images
```
to:
```
{images.length} image{images.length !== 1 ? 's' : ''}
```

Single line change, no other files affected. The summary line (line 111) already handles this correctly.