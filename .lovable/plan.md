

## Fix: Showcase images broken + zoomed

### Root cause
The images referenced in `ProductCategoryShowcase.tsx` (e.g., `fashion-camel-coat.png`, `skincare-serum-model.png`, `food-cocktail-bar.png`) **do not exist** in the `landing-assets` storage bucket. The bucket contains completely different filenames. The previous edit switched from working local paths to non-existent storage URLs.

### Available images in storage (`showcase/` folder)

| Category | Available files |
|----------|----------------|
| Fashion | `fashion-activewear-bright.jpg`, `fashion-activewear-studio.jpg`, `fashion-blazer-golden.jpg`, `fashion-blazer-street.jpg`, `fashion-cashmere-cafe.jpg`, `fashion-dress-botanical.jpg`, `fashion-dress-garden.jpg`, `fashion-street-denim.jpg`, `fashion-streetwear-urban.jpg` |
| Skincare | `skincare-cream-botanical.jpg`, `skincare-cream-moody.jpg`, `skincare-oil-bathroom.jpg`, `skincare-oil-lifestyle.jpg`, `skincare-retinol-model.jpg`, `skincare-serum-marble.jpg`, `skincare-serum-morning.jpg`, `skincare-set-minimal.jpg` |
| Food | `food-acai-bright.jpg`, `food-bread-bakery.jpg`, `food-bread-countertop.png`, `food-coffee-artisan.jpg`, `food-coffee-pourover.jpg`, `food-honey-farmhouse.jpg`, `food-honey-golden.jpg`, `food-pasta-artisan.jpg`, `food-pasta-rustic.jpg`, `food-smoothie-bright.jpg` |
| Home | `home-bedroom-morning.jpg`, `home-candle-evening.jpg`, `home-candle-scandi.jpg`, `home-lamp-desk.jpg`, `home-lamp-evening.jpg`, `home-pendant-kitchen.jpg`, `home-textiles-bedroom.jpg`, `home-vases-japandi.jpg`, `home-vases-shelf.jpg` |

### Fix (single file: `ProductCategoryShowcase.tsx`)

1. **Update all image paths** in `CATEGORIES` to use the actual filenames from storage (`.jpg` not `.png`)
2. **Remove `width: 600`** from `getOptimizedUrl` — use quality-only compression (`{ quality: 60 }`) to prevent server-side cropping/zooming, per existing project convention
3. Keep `object-cover` on the images for proper card fill without distortion

Selected images (4 per category, visually diverse):

- **Fashion**: `fashion-blazer-golden.jpg`, `fashion-dress-botanical.jpg`, `fashion-cashmere-cafe.jpg`, `fashion-streetwear-urban.jpg`
- **Skincare**: `skincare-serum-marble.jpg`, `skincare-cream-botanical.jpg`, `skincare-retinol-model.jpg`, `skincare-oil-lifestyle.jpg`
- **Food**: `food-coffee-artisan.jpg`, `food-pasta-rustic.jpg`, `food-honey-golden.jpg`, `food-smoothie-bright.jpg`, `food-acai-bright.jpg`
- **Home**: `home-candle-evening.jpg`, `home-vases-shelf.jpg`, `home-lamp-evening.jpg`, `home-bedroom-morning.jpg`, `home-pendant-kitchen.jpg`

