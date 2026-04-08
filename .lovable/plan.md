

# Add Product Name + Scene Name to Downloaded Image Filenames

## Problem
Currently, single-image downloads use `product_{sceneName}` and zip downloads use generic `image_{index}` or `scene_name_{index}` filenames. The user wants every downloaded file named as `{ProductName}_{SceneName}.ext` — both for individual downloads and inside the zip.

## Changes

### 1. Single image downloads — `ProductImagesStep6Results.tsx`
Update `handleSingleDownload` to accept `productName` alongside `sceneName` and build filename as `{productName}_{sceneName}`:
```
Verdén_317_Vert_Sauge_Eau_de_Parfum_Front_View.png
```

Also fix the lightbox download handler which currently loses context — pass product name + scene name through.

### 2. Zip downloads — `ProductImagesStep6Results.tsx`
Pass `scene_name` on each `DropImage` so the zip builder uses it for the filename.

### 3. Zip filename builder — `dropDownload.ts`
Update the zip file naming logic to use `{product_title}_{scene_name}_{index}.ext` when both are available. Files will be organized in the zip as:
```
Product_Images/
  Verdén_317_Front_View_1.png
  Verdén_317_Angle_View_2.png
```

### Files modified
1. `src/components/app/product-images/ProductImagesStep6Results.tsx` — pass productName to single download + scene_name to zip images + fix lightbox download
2. `src/lib/dropDownload.ts` — use `product_title + scene_name` for zip filenames

