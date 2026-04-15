

# Fix Product Images on Review Page (Step 4)

## Problem
The product thumbnails in the Review page's "Products" summary card use raw image URLs without optimization, and the single-product layout needs the image to properly fill its container.

## Changes

**File: `src/components/app/product-images/ProductImagesStep4Review.tsx`**

1. **Add import** for `getOptimizedUrl` from `@/lib/imageOptimization`.

2. **Single product image (line 344)** — Add quality-only optimization:
```tsx
// Before
<ShimmerImage src={selectedProducts[0].image_url} ...
// After  
<ShimmerImage src={getOptimizedUrl(selectedProducts[0].image_url, { quality: 70 })} ...
```

3. **Multi-product grid images (line 353)** — Same fix:
```tsx
// Before
<ShimmerImage src={p.image_url} ...
// After
<ShimmerImage src={getOptimizedUrl(p.image_url, { quality: 70 })} ...
```

4. **Prop thumbnails in Advanced Scene Controls (line 300)** — Tiny 16px avatars, safe for width:
```tsx
// Before
<img src={product.image_url} ...
// After
<img src={getOptimizedUrl(product.image_url, { width: 32, quality: 40 })} ...
```

Quality-only for the product cards (flexible `object-contain` containers). Width only for the 16px prop chips.

## Impact
- 1 file, 3 image sources optimized
- No width param on flexible containers — zero crop/zoom risk

