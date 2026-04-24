
## Fix the zoomed mini product images in the Product Visuals flow

### Confirmed issue
The problem is most likely the tiny category/product chips in the Product Visuals flow, especially the mini thumbnails next to category labels like **Beverages** and **Shoes**.

### Root cause
Those mini chips are still using `getOptimizedUrl(..., { width: 40, quality: 40 })`.

That is the exact risky pattern that previously caused the zoom/crop bug:
- `width` triggers the image render endpoint in a way that can tighten framing
- the chip is then displayed inside a tiny square with `object-cover`
- visually this makes the product look zoomed in

### Primary file to fix
- `src/components/app/product-images/ProductImagesStep2Scenes.tsx`
  - Category tab mini product thumbnails beside labels like Beverages / Shoes
  - Current risky code:
    - `getOptimizedUrl(p.image_url, { width: 40, quality: 40 })`

### Related identical-risk spots to fix in the same pass
To avoid the same bug reappearing one step later, normalize the same pattern anywhere else in the Product Images flow:
- `src/components/app/product-images/ProductImagesStep3Details.tsx`
- `src/components/app/product-images/ProductImagesStep3Props.tsx`
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`

These files also contain tiny chips using `width: 40`.

### Implementation
1. Replace every tiny-chip optimization call in those files from:
   - `getOptimizedUrl(url, { width: 40, quality: 40 })`
   to:
   - `getOptimizedUrl(url, { quality: 40 })`

2. Keep all larger scene cards and already-safe quality-only previews unchanged.

3. Re-check the chip CSS after removing `width`:
   - if the mini product still feels too tight because of `object-cover`, switch only those tiny product chips to `object-contain` inside the same rounded wrapper
   - keep scene previews as-is unless they show the same issue

### Safety rules
- Never use `width`, `height`, or `resize` in this fix
- Only use `quality`
- Do not touch selection logic, category grouping, or generation flow
- Do not change full preview, lightbox, download, or result image behavior

### Expected result
- Mini thumbnails next to **Beverages** and **Shoes** keep the original framing
- No zoomed-in or over-cropped product chips
- Same lightweight loading, but without the crop regression

### QA checklist
On `/app/generate/product-images`:
1. Open Step 2 and inspect category chips for:
   - Beverages
   - Shoes
   - Sneakers / Boots if present
2. Confirm the whole product composition looks normal again
3. Open later Product Images steps and verify the same for any small product chips
4. In Network tab, confirm these thumbnail requests use:
   - `/render/image/...?...quality=40`
   - and do **not** contain `width=` or `resize=`

### Summary of planned code changes
- Targeted revert of the risky thumbnail transform pattern in the Product Images mini-chip UI
- Normalize all identical 40px chip cases in the same workflow so the bug is fixed consistently, not just in one place
