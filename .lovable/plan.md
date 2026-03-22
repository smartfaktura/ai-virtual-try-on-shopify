

# Fix Zoomed-In Product Images

## Problem
Adding `width=400` to the image optimization URL causes the server to resize images to 400px width. When these smaller images are displayed in containers using `object-cover`, they appear zoomed-in/cropped because the server crops the image before delivery.

## Solution
Remove the `width` parameter and use quality-only compression — this matches the established pattern noted in the project's image rendering system: "quality-only compression (60-75%) and omits width constraints to prevent server-side cropping."

## Changes

### File: `src/pages/Products.tsx`

1. **Grid view** (line 269): Change `getOptimizedUrl(product.image_url, { width: 400, quality: 70 })` → `getOptimizedUrl(product.image_url, { quality: 70 })`

2. **List view** (line 325): Change `getOptimizedUrl(product.image_url, { width: 112, quality: 70 })` → `getOptimizedUrl(product.image_url, { quality: 70 })`

Two line changes, same file. Images stay compressed for fast loading but maintain their natural aspect ratio without server-side cropping.

