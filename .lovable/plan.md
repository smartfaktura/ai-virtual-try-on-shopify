## Fix prop pill image zoom-crop

The selected-prop pill in Advanced Scene Controls currently builds its avatar with `getOptimizedUrl(url, { width: 32, quality: 40 })`. Per our project rule, passing `width` without `height` to Supabase's render endpoint crops server-side and produces a zoomed-in result. The PropPickerModal popup already uses quality-only correctly — only this pill is wrong.

### Change

`src/components/app/product-images/ProductImagesStep4Review.tsx` L504 — drop the `width` param so the image is compressed but not cropped, and let `object-cover` on the 16×16 round avatar fill the placeholder cleanly:

```tsx
<img
  src={getOptimizedUrl(product.image_url, { quality: 50 })}
  alt={product.title}
  className="w-4 h-4 rounded-full object-cover flex-shrink-0"
/>
```

No other files affected — the PropPickerModal pop-up already uses `getOptimizedUrl(p.image_url, { quality: 60 })` with `object-cover` and is correct.