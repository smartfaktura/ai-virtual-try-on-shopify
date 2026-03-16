

## Replace Home & Living showcase images

### Changes

1. **Copy 5 uploaded images** to `public/images/showcase/`:
   - `user-uploads://ccfaf5c8-...` → `home-candle-evening.png` (body wash on driftwood)
   - `user-uploads://7cd4f59f-...` → `home-vases-shelf.png` (living room with art)
   - `user-uploads://e6ce9d0d-...` → `home-lamp-evening.png` (woman with headphones)
   - `user-uploads://Freestyle-8983ac09.png` → `home-bedroom-morning.png` (sculpture vase)
   - `user-uploads://52b8ed66-...` → `home-pendant-kitchen.png` (living room with olive tree)

2. **Update `ProductCategoryShowcase.tsx` line 99-103** — replace `s(...)` URLs with 5 direct local paths:
   ```typescript
   {
     label: 'Home & Living',
     images: [
       '/images/showcase/home-candle-evening.png',
       '/images/showcase/home-vases-shelf.png',
       '/images/showcase/home-lamp-evening.png',
       '/images/showcase/home-bedroom-morning.png',
       '/images/showcase/home-pendant-kitchen.png',
     ],
     cycleDuration: 7500,
   },
   ```

Direct local paths — no `getOptimizedUrl` width parameter, no zoom/crop. Same pattern as all other categories.

