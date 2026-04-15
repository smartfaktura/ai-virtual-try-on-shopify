

# Add 2 Demo Products + Fix Image Fitting

## Changes

### 1. Copy 2 new product images to `public/images/demos/`
- `demo-chair.png` — Luxury bouclé armchair (from uploaded chair image)
- `demo-handbag.png` — Leather hobo handbag (from uploaded handbag image)

### 2. Update `DemoProductPicker.tsx`

**Add 2 entries to DEMO_PRODUCTS:**
```ts
{ id: 'demo_chair', title: 'Bouclé Armchair', category: 'Furniture', src: '/images/demos/demo-chair.png' },
{ id: 'demo_handbag', title: 'Leather Handbag', category: 'Bags', src: '/images/demos/demo-handbag.png' },
```

**Fix image fitting — use `aspectRatio` prop on ShimmerImage** so the shimmer placeholder has the correct dimensions before the image loads (currently it collapses because aspect-square is on a parent div but ShimmerImage wrapper doesn't know the ratio):

```tsx
<ShimmerImage
  src={product.src}
  alt={product.title}
  aspectRatio="1/1"
  className="w-full h-full object-contain"
/>
```

Remove the outer `aspect-square` div wrapper and let `ShimmerImage`'s `aspectRatio` prop handle it, ensuring the shimmer placeholder renders at the correct size.

**Widen dialog** to `sm:max-w-xl` to accommodate 3 columns of 9 products cleanly.

### 3. Optimize demo images
Run image optimization on all 9 demo PNGs (resize to max 512px, compress) so the picker loads fast and the fetch-to-File conversion is lightweight.

## Files changed
- Copy 2 images to `public/images/demos/`
- `src/components/app/product-images/DemoProductPicker.tsx` — add products, fix shimmer placeholder, widen dialog

