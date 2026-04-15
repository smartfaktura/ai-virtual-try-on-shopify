

# Fix Product Selection Grid — Remove Width-Based Crop

## Problem
The Step 1 product grid in `/app/generate/product-images` uses `getOptimizedUrl(p.image_url, { width: 280, quality: 70 })`. The `width: 280` triggers Supabase's server-side crop before the browser applies `object-contain`, producing the same zoomed-in artifact we fixed on workflow cards.

These product cards display arbitrary aspect ratio images inside `aspect-square` containers with `object-contain` — so server-side width cropping is incorrect.

## Fix

**File: `src/components/app/product-images/ProductImagesStep1Products.tsx`** (line 138)

Change:
```typescript
src={getOptimizedUrl(p.image_url, { width: 280, quality: 70 })}
```
To:
```typescript
src={getOptimizedUrl(p.image_url, { quality: 70 })}
```

One line change. Keeps quality compression (~70% savings) but stops the server crop.

