

## Swap Hero "Cropped Tee" Showcase to Use /try Images

### What changes
**File: `src/components/landing/HeroSection.tsx`**

Replace the first showcase entry (Cropped Tee) to use:
- **Product image**: `/images/source-crop-top.jpg` (the same flat-lay source used on /try) instead of the Supabase-hosted `hero-product-tshirt.jpg`
- **Output images**: Pick 8 of the 12 `/images/try-showcase/` images (the hero carousel shows 8 per product), using the same titles from ChannelShowcase

Updated first showcase entry:
```typescript
{
  product: { img: '/images/source-crop-top.jpg', label: 'Cropped Tee', subtitle: '1 product photo' },
  outputs: [
    { img: '/images/try-showcase/garden-editorial.png', label: 'Garden Editorial' },
    { img: '/images/try-showcase/virtual-tryon-1.png', label: 'Basketball Court' },
    { img: '/images/try-showcase/cafe-lifestyle.png', label: 'Café Lifestyle' },
    { img: '/images/try-showcase/golden-hour.png', label: 'Golden Hour' },
    { img: '/images/try-showcase/studio-lookbook.png', label: 'Studio Lookbook' },
    { img: '/images/try-showcase/urban-edge.png', label: 'Urban Edge' },
    { img: '/images/try-showcase/pilates-studio.png', label: 'Pilates Studio' },
    { img: '/images/try-showcase/studio-dark.png', label: 'Studio Portrait' },
  ],
  caption: 'Same tee — ∞ environments — 12 seconds',
}
```

Since these are local paths (not Supabase URLs), the `optimizeProduct` / `optimizeOutput` wrappers (which call `getOptimizedUrl`) will be bypassed or will pass through the local path unchanged — this is fine since local assets don't support Supabase image transforms anyway.

### No other files change
The Serum and Ring showcases remain unchanged (still using Supabase storage URLs). Only the Cropped Tee showcase swaps to local assets to match `/try`.

