## Fix mini thumbnail load experience

Pill chip thumbnails in `ProductImagesStep4Review.tsx` (lines 284, 320, 339) currently fetch the full-size image with only `quality: 40` and lazy default loading. On slow connections users see the original large image cropped into the 20px circle while it streams in.

Per project memory ("Image Optimization No-Crop — width only for fixed thumbnails"), fixed tiny circles are exactly when `width` is appropriate.

### Changes (single file: `src/components/app/product-images/ProductImagesStep4Review.tsx`)

For all three pill `<img>` tags (products at L284, per-category scenes at L320, flat scenes at L339):
- Add `width: 64` to `getOptimizedUrl` (3× the 20px render = sharp on retina, tiny payload)
- Add `loading="eager"`, `decoding="async"`, `width={20} height={20}` HTML attrs so the browser reserves the box before bytes arrive (eliminates the half-loaded crop artifact)

Example:
```tsx
<img
  src={getOptimizedUrl(p.image_url, { width: 64, quality: 60 })}
  alt={p.title}
  width={20}
  height={20}
  loading="eager"
  decoding="async"
  className="w-5 h-5 rounded-full object-cover bg-muted flex-shrink-0"
/>
```

`bg-background` → `bg-muted` so the placeholder ring matches the chip while loading.

### Out of scope
No other files, no layout changes, no logic changes.
