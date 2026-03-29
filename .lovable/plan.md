

# Optimize Scene & Product Thumbnail Loading

## Problem
1. **Scene grid images** in WorkflowSettingsPanel call `getOptimizedUrl(url, { quality: 60 })` but omit a `width` param — full-resolution images load for small ~200px thumbnails
2. **Product cards** in ProductMultiSelect use raw `product.images[0].url` with zero optimization — full product images load for tiny ~100px thumbnails

## Changes

### 1. WorkflowSettingsPanel scene thumbnails
**File: `src/components/app/generate/WorkflowSettingsPanel.tsx`** (line 399)

Add `width: 400` to the `getOptimizedUrl` call for scene preview images. These render at ~150-250px on screen, so 400px covers 2x density.

```tsx
// Before
getOptimizedUrl(v.preview_url, { quality: 60 })

// After
getOptimizedUrl(v.preview_url, { width: 400, quality: 60 })
```

### 2. ProductMultiSelect product thumbnails
**File: `src/components/app/ProductMultiSelect.tsx`** (line 88)

Import `getOptimizedUrl` and wrap the product image URL. These cards are ~100px squares, so `width: 200` at quality 50 is sufficient.

```tsx
// Before
<img src={product.images[0].url} ...

// After
<img src={getOptimizedUrl(product.images[0].url, { width: 200, quality: 50 })} ...
```

Both changes use the existing `getOptimizedUrl` utility that converts Supabase storage URLs to the render/transform endpoint with size and quality params — cutting bandwidth ~70% per thumbnail.

