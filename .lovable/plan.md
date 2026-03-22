

# Optimize Product Image Loading with Thumbnails

## Problem
Products page loads full-size images for grid thumbnails and list thumbnails, which will get slow as the product count grows.

## Solution
Use the existing `getOptimizedUrl()` utility to serve resized, compressed thumbnails instead of full-size images.

## Changes

### File: `src/pages/Products.tsx`

1. **Import** `getOptimizedUrl` from `@/lib/imageOptimization`

2. **Grid view** (line 267): Replace `product.image_url` with `getOptimizedUrl(product.image_url, { width: 400, quality: 70 })` — grid cards are ~25% viewport width, 400px is plenty for 2x retina

3. **List view** (line 324): Replace `product.image_url` with `getOptimizedUrl(product.image_url, { width: 112, quality: 70 })` — list thumbnails are 56px (w-14), so 112px covers 2x retina

Two `src` attribute changes + one import. Images load significantly faster with no visible quality loss.

