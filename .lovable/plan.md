

## Replace Fashion & Apparel showcase images

### Changes

1. **Copy 4 uploaded images** to `public/images/showcase/`:
   - `user-uploads://08eda35b-...` → `public/images/showcase/fashion-camel-coat.png`
   - `user-uploads://faeb813c-...` → `public/images/showcase/fashion-white-suit.png`
   - `user-uploads://eee672dd-...` → `public/images/showcase/fashion-knit-loft.png`
   - `user-uploads://aa7962f0-...` → `public/images/showcase/fashion-activewear-gym.png`

2. **Update `ProductCategoryShowcase.tsx`** — replace the 5 `s(...)` Fashion images with 4 direct local paths (same pattern as Skincare):
   ```typescript
   {
     label: 'Fashion & Apparel',
     images: [
       '/images/showcase/fashion-camel-coat.png',
       '/images/showcase/fashion-white-suit.png',
       '/images/showcase/fashion-knit-loft.png',
       '/images/showcase/fashion-activewear-gym.png',
     ],
     cycleDuration: 7000,
   },
   ```

Direct local paths — no `getOptimizedUrl` width parameter, no zoom/crop. Single file edit + 4 image copies.

