

# Add Uploaded Images to Fashion & Apparel Showcase

## What changes

Add the 3 uploaded fashion/model images as the first shots in the Fashion & Apparel category rotation on the landing page.

## Steps

| # | Action | Detail |
|---|--------|--------|
| 1 | Copy images to project | Copy the 3 uploaded images to `public/images/showcase/` with clean filenames |
| 2 | Update CATEGORIES array | Prepend 3 new image paths before the existing 4 Fashion images, using direct `/images/showcase/` paths (non-Supabase URLs pass through `getOptimizedUrl` unchanged) |

**File: `src/components/landing/ProductCategoryShowcase.tsx`**

Update the Fashion & Apparel entry to include the new images first:

```typescript
{
  label: 'Fashion & Apparel',
  images: [
    '/images/showcase/fashion-portrait-curls.jpg',
    '/images/showcase/fashion-white-dress-stadium.jpg',
    '/images/showcase/fashion-blonde-coat.jpg',
    s('fashion-camel-coat.png'),
    s('fashion-white-suit.png'),
    s('fashion-knit-loft.png'),
    s('fashion-activewear-gym.png'),
  ],
  cycleDuration: 7000,
},
```

The new images won't go through Supabase optimization (since they're local assets), but they'll be served directly from the public folder which is efficient for static assets. The existing Supabase-hosted images continue using the `s()` helper as before.

