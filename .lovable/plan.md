

## Replace Food & Drinks showcase images

### Changes

1. **Copy 5 uploaded images** to `public/images/showcase/`:
   - `freestyle-1_40.png` → `food-cocktail-bar.png` (red cocktail)
   - `freestyle-34.png` → `food-avocado-toast.png` (avocado toast)
   - `freestyle-10_1.png` → `food-pavlova-berries.png` (pavlova cake)
   - `freestyle-8_1.png` → `food-raspberry-dessert.png` (pink dessert)
   - `freestyle-6_2.png` → `food-cocktail-rocks.png` (orange cocktail)

2. **Update `ProductCategoryShowcase.tsx`** — replace the Food & Drinks entry's `s(...)` URLs with 5 direct local paths:
   ```typescript
   {
     label: 'Food & Drinks',
     images: [
       '/images/showcase/food-cocktail-bar.png',
       '/images/showcase/food-avocado-toast.png',
       '/images/showcase/food-pavlova-berries.png',
       '/images/showcase/food-raspberry-dessert.png',
       '/images/showcase/food-cocktail-rocks.png',
     ],
     cycleDuration: 6000,
   },
   ```

Direct local paths, no server-side optimization width parameter, no zoom/crop. Same pattern as Fashion and Skincare.

