
## Fix product image not filling thumbnail tile

### Cause
In `AiStylistCard.tsx` the tile is `w-10 h-10` (40px) with `p-1` padding, leaving only ~32px for the image, AND uses `object-contain` which shrinks small/tall garments further. Result: a tiny icon-like image floating in a big empty box (visible in screenshot).

### Fix
In `src/components/app/product-images/AiStylistCard.tsx`:
1. Make the tile bigger and squarer: `w-12 h-12` (48px), `rounded-lg`
2. Remove inner `p-1` padding so the image uses the full tile
3. Keep `object-contain` (so full garments stay visible, no crop) but on a larger frame it will look properly filled
4. Add subtle `bg-muted/30` so any whitespace blends rather than looking empty

Resulting tile:
```tsx
<div className="w-12 h-12 rounded-lg bg-muted/30 border border-border/40 overflow-hidden flex items-center justify-center flex-shrink-0">
  <img src={getOptimizedUrl(product.image_url, { quality: 70 })}
       alt={product.title}
       className="w-full h-full object-contain" />
</div>
```

### File
- `src/components/app/product-images/AiStylistCard.tsx` (tile sizing + padding only)

### Validation
1. Black Ruched Crop Top → image fills the 48×48 tile edge-to-edge, no empty padding around it
2. Wider products (shoes, bags) still fully visible (no crop)
3. Row height adjusts cleanly, no layout break
