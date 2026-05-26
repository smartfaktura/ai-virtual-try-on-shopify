Replace dynamic random thumbnails with the 3 fixed Brand Scene preview URLs the user provided.

**Changes:**

1. `BrandScenesPromoCard.tsx` — Remove `thumbnails` prop. Define a local `BRAND_SCENE_THUMBNAILS` constant with the 3 provided URLs and use them directly.
2. `BrandScenesInfoModal.tsx` — Remove `thumbnails` prop. Use the same `BRAND_SCENE_THUMBNAILS` constant (imported from PromoCard or duplicated locally).
3. `ProductImagesStep2Scenes.tsx` — Remove `promoThumbnails` memo and stop passing `thumbnails` to `<BrandScenesPromoCard />`.

Will export `BRAND_SCENE_THUMBNAILS` from a small shared constant at the top of `BrandScenesPromoCard.tsx` and import into the modal to avoid duplication.