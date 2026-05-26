## Goal

Make circular/square thumbnail placeholders **fill** their frame instead of letterboxing into white, without re-introducing the previous "zoomed" crop. Apply to both the Review chip thumbs and the **Add Props / Accessories** modal cards.

## Why this works (no zoom)

The prior zoom was caused by Supabase `/render/image/?width=64` which crops server-side. We already switched all of these to **quality-only** `getOptimizedUrl(url, { quality: 60 })`, so the source returned is the full untouched image. Going back to `object-cover` on the client only fits the original to the container — no extra crop, no zoom-in past the source.

## Edits

### 1. Review summary chips fill the circle (`ProductImagesStep4Review.tsx`)

- L284 (product chip): `object-contain` → `object-cover`
- L320 (scene chip in category groups): `object-contain` → `object-cover`
- L339 (scene chip flat list): `object-contain` → `object-cover`

Optimization stays quality-only (no `width:` param).

### 2. Product context strip fills the tile (`ProductContextStrip.tsx`)

- L29 `<ShimmerImage … className="w-full h-full object-contain" />` → `object-cover`

Already wrapped with `getOptimizedUrl(p.image_url, { quality: 60 })`.

### 3. Add Props / Accessories modal — fill the card & optimize source (`ProductImagesStep3Refine.tsx`, L485-487)

Current:
```tsx
<div className="aspect-square bg-muted overflow-hidden flex items-center justify-center p-2">
  <ShimmerImage src={p.image_url} alt={p.title} className="max-w-full max-h-full object-contain" />
</div>
```

Change to:
```tsx
<div className="aspect-square bg-muted overflow-hidden">
  <ShimmerImage
    src={getOptimizedUrl(p.image_url, { quality: 60 })}
    alt={p.title}
    className="w-full h-full object-cover"
  />
</div>
```

- Drops `p-2` padding and `flex items-center justify-center` so the image fills the card edge-to-edge.
- Uses quality-only optimization (matches project memory "Image Optimization No-Crop: never width param on full-bleed").
- Adds `import { getOptimizedUrl } from '@/lib/imageOptimization';` to the file if not already present.

## Out of scope

No layout/grid/sizing changes; no other components touched.
