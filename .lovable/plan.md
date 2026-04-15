# Add "Try demo product" to Product Images Step 1

## Overview

Add a secondary "Try a demo product" button below the primary upload CTA in the empty state. Clicking it opens a clean dialog/sheet with 7 demo products (the uploaded images). Selecting one inserts it into `user_products` via the same flow as `handleQuickUpload` — upload to storage, analyze, create record, auto-select.

## Demo Products

Copy the 7 uploaded images to `public/images/demos/`:

- `demo-scarf.png` (Navy Pattern Scarf)
- `demo-cap.png` ("Beauty & Brains" Cap)
- `demo-shampoo.png` (Aurum Shampoo Bottle)
- `demo-jeans.png` (Light Wash Jeans)
- `demo-hoodie.png` (Cream Zip Hoodie)
- `demo-backpack.png` (Backpack)
- `demo-eyewear.png` (Burgundy Cat-eye Glasses)

## Implementation

### 1. New component: `src/components/app/product-images/DemoProductPicker.tsx`

A `Dialog` (desktop) / `Drawer` (mobile) containing:

- Title: "Try a demo product"
- Subtitle: "Pick one to see how it works"
- 2-column grid of demo product cards (image + label + category badge)
- Each card: rounded-xl, aspect-square image, product name below, subtle hover ring
- On click: closes dialog, triggers the upload+analyze flow

Demo product data array:

```ts
const DEMO_PRODUCTS = [
  { id: 'demo_scarf', title: 'Silk Scarf', category: 'Scarves', src: '/images/demos/demo-scarf.png' },
  { id: 'demo_cap', title: 'Baseball Cap', category: 'Hats', src: '/images/demos/demo-cap.png' },
  { id: 'demo_shampoo', title: 'Luxury Shampoo', category: 'Beauty', src: '/images/demos/demo-shampoo.png' },
  { id: 'demo_jeans', title: 'High-Rise Jeans', category: 'Jeans', src: '/images/demos/demo-jeans.png' },
  { id: 'demo_hoodie', title: 'Zip Hoodie', category: 'Hoodies', src: '/images/demos/demo-hoodie.png' },
  { id: 'demo_backpack', title: 'Urban Backpack', category: 'Backpacks', src: '/images/demos/demo-backpack.png' },
  { id: 'demo_eyewear', title: 'Cat-Eye Glasses', category: 'Eyewear', src: '/images/demos/demo-eyewear.png' },
];
```

### 2. Flow on demo product select

1. Fetch the image from `public/images/demos/...` as a `File` blob
2. Call `handleQuickUpload(file)` — same path as user uploads (storage → analyze → insert → auto-select)
3. This ensures the demo product goes through full analysis and gets proper category-aware shots in Step 2

### 3. Update empty state in `ProductImages.tsx` (lines 1034-1062)

Add after the upload button:

```tsx
<div className="flex items-center gap-3 text-xs text-muted-foreground">
  <div className="h-px flex-1 bg-border" />
  <span>or</span>
  <div className="h-px flex-1 bg-border" />
</div>
<Button variant="outline" onClick={() => setDemoPickerOpen(true)} className="gap-2">
  <Package className="w-4 h-4" />
  Try a demo product
</Button>
```

New state: `const [demoPickerOpen, setDemoPickerOpen] = useState(false);`

Render `<DemoProductPicker>` at the bottom of the component.

## Files changed

- Copy 7 images to `public/images/demos/`
- New: `src/components/app/product-images/DemoProductPicker.tsx`
- Edit: `src/pages/ProductImages.tsx` — add demo picker state, button in empty state, render picker component