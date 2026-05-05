## Replace Riviera visuals + remix gallery order

### 1. Copy uploaded images to project
- `user-uploads://vovv.ai-1-2.jpg` → `public/images/showcase/brite-riviera-zara.jpg` (Zara version)
- `user-uploads://vovv.ai-2.jpg` → `public/images/showcase/brite-riviera-freya.jpg` (Freya version)

### 2. Update `src/pages/showcase/BriteShowcase.tsx`

Replace the two Riviera Pop Escape entries with local paths:
- Zara: `/images/showcase/brite-riviera-zara.jpg`
- Freya: `/images/showcase/brite-riviera-freya.jpg`

Remix the entire IMAGES array order so no two same-scene entries are adjacent. Spread duplicates (Fisheye Portrait, Tennis Court, Golden Splash Cheers, Sunburn Editorial Sip, Sport Flash Soda Energy, Close Face Drink Hold, Sport Sun Shadow, Riviera Pop Escape) far apart. Alternate product-only and on-model shots for visual variety.
