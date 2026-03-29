

# Add Uploaded Images to Beauty Showcase

## What changes

Add the 5 uploaded fragrance/beauty images as the first shots in the "Beauty" category rotation on the landing page.

## Steps

| # | Action | Detail |
|---|--------|--------|
| 1 | Copy images to `public/images/showcase/` | Save as `beauty-perfume-ice.jpg`, `beauty-perfume-driftwood.jpg`, `beauty-perfume-splash.jpg`, `beauty-perfume-rocks.jpg`, `beauty-perfume-aloe.jpg` |
| 2 | Update CATEGORIES array | Prepend 5 new `/images/showcase/` paths before the existing 4 Beauty images in `src/components/landing/ProductCategoryShowcase.tsx` |

**Updated Beauty entry:**

```typescript
{
  label: 'Beauty',
  images: [
    '/images/showcase/beauty-perfume-ice.jpg',
    '/images/showcase/beauty-perfume-driftwood.jpg',
    '/images/showcase/beauty-perfume-splash.jpg',
    '/images/showcase/beauty-perfume-rocks.jpg',
    '/images/showcase/beauty-perfume-aloe.jpg',
    s('skincare-serum-marble.png'),
    s('skincare-perfume-vanity.png'),
    s('skincare-serum-model.png'),
    s('skincare-model-light.png'),
  ],
  cycleDuration: 8500,
},
```

Local assets served directly from `/public`, existing Supabase images continue using `s()` optimization.

