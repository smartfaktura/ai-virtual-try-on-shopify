

# Fix ZIP Download Naming to Match Single-Image Downloads

## Problem
When downloading a single image, files are named `{ProductName}_{SceneName}.ext`. But when downloading as ZIP, `scene_name` is not passed to the download function, so files get generic names like `image_1.png` inside a "Product Images" folder.

## Fix

### File: `src/components/app/product-images/ProductImagesStep6Results.tsx` (lines 79-84)
Pass `scene_name` from each image into the `DropImage` object:

```ts
dropImages.push({
  url: img.url,
  workflow_name: 'Product Images',
  product_title: productName,
  scene_name: img.sceneName,
});
```

This single change makes the ZIP use the existing branch in `dropDownload.ts` (line 41-44) that formats filenames as `{Product}_{Scene}_{index}.ext`, which closely matches the single-download naming.

### Files changed
1. `src/components/app/product-images/ProductImagesStep6Results.tsx` — add `scene_name` to ZIP download payload

