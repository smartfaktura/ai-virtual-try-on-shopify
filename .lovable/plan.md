

## Fix: mini chip thumbnails have gaps — fill the placeholder properly

### What I see
After the last fix, the **Beverages** and **Shoes** category chips now show the full product (no zoom), but the product sits inside a larger square with empty white gaps around it. The thumbnail isn't filling its container.

### Root cause
In the last pass I changed the chip image to `object-contain bg-white` to kill the zoom. `object-contain` preserves aspect ratio by **shrinking the image to fit**, which leaves transparent/white gaps when the source image is taller or wider than the square slot — exactly what's visible now.

What I want instead: the chip wrapper should be **tight to the product** with minimal padding, so it reads as a clean product mark, not a small image floating in a big white box.

### Fix in `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

For the category chip thumbnails (the ~28–32px squares next to "Beverages" / "Shoes"):

1. **Keep** `object-contain` + `bg-white` (these are what prevent the zoom — non-negotiable).
2. **Tighten the wrapper**:
   - Reduce wrapper size slightly so the product visually fills more of the chip.
   - Add small inner padding (`p-0.5`) so the product breathes but doesn't float.
   - Round corners match (`rounded-md`).
3. **Center the image** with `flex items-center justify-center` on the wrapper so the contained image is perfectly centered, no top/bottom drift.

Resulting pattern (chip only):
```tsx
<div className="w-7 h-7 rounded-md bg-white border border-border/40 flex items-center justify-center p-0.5 overflow-hidden">
  <img
    src={getOptimizedUrl(p.image_url, { quality: 40 })}
    className="max-w-full max-h-full object-contain"
    loading="lazy"
    alt={p.title}
  />
</div>
```

### Safety rules (unchanged)
- Quality-only optimization. **Never** `width`, `height`, or `resize`.
- Only the **category chip** in Step 2 is touched. Scene cards, product grids, Step 3 chips — untouched.
- No selection logic, category grouping, or generation flow changes.

### Expected result
- Beverages / Shoes chips show the product **centered and filling the chip** with only a tiny breathing margin.
- No zoom/crop.
- No empty gaps.

### QA
On `/app/generate/product-images` Step 2:
1. Beverages chip → can fills the square cleanly.
2. Shoes chip → shoe fills the square cleanly.
3. Network tab → request URL contains `?quality=40`, no `width=`, no `resize=`.

