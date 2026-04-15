

# Fix Product Image Containment in Review Cards

## Problem
The product thumbnail in the Review page (Step 4) doesn't fill its frame — the `p-1` padding + `object-contain` creates visible white gaps around the image.

## Changes

**File: `src/components/app/product-images/ProductImagesStep4Review.tsx`**

### 1. Single product image (line 344)
Remove `p-1` padding and switch from `object-contain` to `object-cover`:
```tsx
// Before
<div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-border/40 p-1 flex-shrink-0">
  <ShimmerImage ... className="w-full h-full object-contain" />

// After
<div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-border/40 flex-shrink-0">
  <ShimmerImage ... className="w-full h-full object-cover" />
```

### 2. Multi-product grid images (line 353-354)
Same fix — remove `p-1`, switch to `object-cover`:
```tsx
// Before
<div className="aspect-square rounded-lg overflow-hidden bg-white border border-border/40 p-1">
  <ShimmerImage ... className="w-full h-full object-contain" />

// After
<div className="aspect-square rounded-lg overflow-hidden bg-white border border-border/40">
  <ShimmerImage ... className="w-full h-full object-cover" />
```

## Impact
- 1 file, 2 lines changed
- Product images now fill their frames cleanly

