

# Optimize Product Selector Image Loading

## Problem
The product picker popover loads **full-resolution product images** (raw uploads, potentially 2-5MB each) for tiny ~80px thumbnails. With 20+ products, this means 40-100MB of unnecessary image data, causing slow load times.

## Changes

### `src/components/app/freestyle/ProductSelectorChip.tsx`

1. **Use `getOptimizedUrl`** to serve thumbnails at appropriate size (width: 200, quality: 60) — sufficient for the small grid cards
2. **Use `ShimmerImage`** instead of raw `<img>` for shimmer placeholders while loading
3. **Add `loading="lazy"`** — already default in ShimmerImage

**Before:**
```tsx
<img src={product.image_url} alt={product.title} className="w-full aspect-square object-cover rounded-t-md" />
```

**After:**
```tsx
<ShimmerImage
  src={getOptimizedUrl(product.image_url, { width: 200, quality: 60 })}
  alt={product.title}
  className="w-full aspect-square object-cover rounded-t-md"
  aspectRatio="1/1"
/>
```

4. Apply the same optimization to the **sample product images** and the **selected product thumbnail** in the trigger button.

### Files
- `src/components/app/freestyle/ProductSelectorChip.tsx` — import `getOptimizedUrl` + `ShimmerImage`, apply to all product images

