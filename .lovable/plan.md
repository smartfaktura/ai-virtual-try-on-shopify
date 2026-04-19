
## Fix zoomed product thumbnail in AI Stylist card

### Cause
`ProductThumbnail` (used in `AiStylistCard`) calls `getOptimizedUrl(imageUrl, { width: optimizeWidth, quality: 70 })`. Per project memory (`mem://style/image-optimization-no-crop`), passing `width` triggers Supabase's server-side crop-zoom — which is exactly what the screenshot shows (the black ruched crop top is cropped to a tiny black sliver).

### Fix
In `src/components/app/product-images/ProductThumbnail.tsx`, drop the `width` param and keep quality only:

```ts
src={getOptimizedUrl(imageUrl, { quality: 70 })}
```

Also switch the default `fit` for the AI Stylist card usage to `contain` so full garments (crop tops, dresses, shoes) show edge-to-edge instead of being cover-cropped inside the small 36×36 tile. Update the `<ProductThumbnail … />` call in `AiStylistCard.tsx` to pass `fit="contain"`.

### Files
- `src/components/app/product-images/ProductThumbnail.tsx` — remove `width` from `getOptimizedUrl` call
- `src/components/app/product-images/AiStylistCard.tsx` — pass `fit="contain"` to the thumbnail

### Risk
None. Quality-only optimization is the project standard for non-fixed-thumbnail contexts; `contain` prevents the visual crop without changing the tile size.

### Validation
1. Reload Step 3 with the Black Ruched Crop Top → thumbnail shows full garment, not zoomed sliver
2. Try with a dress, shoes, hoodie → all visible in full inside the tile
3. No layout shift in the card
