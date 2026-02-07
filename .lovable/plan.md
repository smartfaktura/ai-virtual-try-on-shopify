

## Product Category Showcase Section

A new section for the landing page that demonstrates Brandframe.ai's versatility across product categories — inspired by the reference screenshot. Four cards (Fashion & Apparel, Skincare, Food & Drinks, Home & Living) each auto-cycle through high-quality AI-generated images at staggered intervals, with a thin progress bar on top of each card that fills as the current image displays.

### Visual Design

- Dark-themed section background (`bg-zinc-950` or similar dark tone) to make the product cards pop
- Headline: **"All products look better here"** (matching the reference style)
- 4 cards in a responsive grid (1 col mobile, 2 col tablet, 4 col desktop)
- Each card has:
  - A category label in the top-left corner (e.g., "Fashion & Apparel")
  - A thin white/primary progress bar at the top that animates from 0% to 100% over the card's cycle duration
  - Smooth crossfade transitions between images
  - Rounded corners and subtle border

### Staggered Auto-Rotation

Each card rotates images at a different interval to create an organic, non-synchronized feel:
- Fashion & Apparel: ~4s cycle
- Skincare: ~5s cycle  
- Food & Drinks: ~3.5s cycle
- Home & Living: ~4.5s cycle

The progress bar resets and re-animates each time a new image appears.

### Image Sources

We'll use existing assets from the project, grouped by category:

- **Fashion & Apparel**: hero output images (crop top in various scenes) + drop model images
- **Skincare**: serum hero variations (studio, bathroom, shadows, garden, moody, etc.)
- **Food & Drinks**: template food images + product food items (coffee beans, honey, chocolate, juice, granola)
- **Home & Living**: template home images + product home items (candle, lamp, pillow, planter, carafe)

### Technical Implementation

**New file:** `src/components/landing/ProductCategoryShowcase.tsx`

- A `CategoryCard` component that:
  - Accepts an array of images, a category label, and a cycle duration
  - Uses `useState` for the current image index and `useEffect` with `setInterval` for auto-rotation
  - Renders two `<img>` layers with opacity transitions for smooth crossfade
  - Renders a progress bar div with CSS animation (`@keyframes` or inline style with `transition`) that fills over the duration, resetting on each image change via a `key` prop
- The parent component renders 4 `CategoryCard` instances with different durations

**Modified file:** `src/pages/Landing.tsx`

- Import and add `<ProductCategoryShowcase />` to the page layout, placed after `HowItWorks` and before `ModelShowcaseSection`

### Component Structure

```text
ProductCategoryShowcase
+-- Section wrapper (dark bg, centered heading)
+-- Grid (4 columns on desktop)
    +-- CategoryCard (Fashion & Apparel, 4s)
    |   +-- Progress bar (animated width 0->100%)
    |   +-- Category label overlay
    |   +-- Image stack (crossfade)
    +-- CategoryCard (Skincare, 5s)
    +-- CategoryCard (Food & Drinks, 3.5s)
    +-- CategoryCard (Home & Living, 4.5s)
```

### Asset Mapping

Each card will cycle through 4-6 existing images:

| Category | Assets |
|----------|--------|
| Fashion & Apparel | `hero-output-studio`, `hero-output-park`, `hero-output-rooftop`, `hero-output-urban`, `hero-output-beach` |
| Skincare | `hero-serum-studio`, `hero-serum-shadows`, `hero-serum-bathroom`, `hero-serum-moody`, `hero-serum-garden` |
| Food & Drinks | `templates/food-rustic`, `templates/food-commercial`, `templates/food-packaging`, `products/coffee-beans`, `products/honey-organic` |
| Home & Living | `templates/home-japandi`, `templates/home-warm`, `templates/home-concrete`, `products/candle-soy`, `products/lamp-brass` |

No new AI-generated images needed — all sourced from existing assets.

