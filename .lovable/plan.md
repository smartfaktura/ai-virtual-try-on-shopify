

## Fix "Your Upload" Card — Stacking Product Images

### Root Cause
The desktop product card (lines 399-416) renders 3 `ShimmerImage` components inside a `relative aspect-[3/4]` container. Each ShimmerImage creates its own wrapper `<div>` in normal flow. Even with `opacity: 0`, the invisible images still take up vertical space, causing the card to be ~3x too tall.

### Fix
Add `wrapperClassName="absolute inset-0"` and `wrapperStyle` to each ShimmerImage inside the product card so all 3 images overlay each other instead of stacking:

**Desktop card (lines 400-412):**
```tsx
<ShimmerImage
  key={scIdx}
  src={optimizeProduct(sc.product.img)}
  alt={sc.product.label}
  wrapperClassName="absolute inset-0"
  className="w-full h-full object-cover transition-opacity duration-500"
  width={200}
  height={267}
  fetchPriority={scIdx === 0 ? 'high' : undefined}
  style={{ opacity: scIdx === activeScene ? 1 : 0 }}
/>
```

**Mobile bottom strip product thumbnail (lines 352-363):** Same fix — add `wrapperClassName="absolute inset-0"` to the ShimmerImages there too, since the same stacking issue exists in the small 48x64 thumbnail.

### File
- `src/components/landing/HeroSection.tsx` — 2 locations (desktop card ~line 401, mobile thumbnail ~line 353)

