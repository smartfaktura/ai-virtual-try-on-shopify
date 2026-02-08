

## Improve "How It Works" Step 2 Images + Add Hover Popups

### What's changing

Two improvements to the "Three Steps to Automated Product Visuals" section:

**1. Regenerate 4 higher-quality, cohesive images using the pro model**

The current AI-generated images don't feel connected enough. We'll regenerate all 4 formula images using `google/gemini-3-pro-image-preview` (higher quality model) with more specific prompts:

- **Product**: Clean white crop top flatlay on pure white background -- professional e-commerce product shot, centered, soft shadows, no model
- **Model**: Young blonde woman portrait, wearing a casual white t-shirt, soft studio lighting, light gray background, face forward, warm natural smile, supermodel quality
- **Scene**: Empty modern yoga studio interior with warm wood floors, natural light from large windows, no people, clean and inviting
- **Result**: The same blonde model from the portrait, now wearing the white crop top, standing in the same yoga studio, natural lifestyle photography, full body shot

This creates a visually convincing "formula" where visitors can see the product + model + scene combine into a realistic result.

**2. Add hover popup preview on each thumbnail**

When a visitor hovers over any of the 4 formula thumbnails (Product, Model, Scene, Result), a larger preview image will appear as a floating card above/beside the thumbnail. This makes the section more engaging and interactive.

- Uses a custom hover state (no extra library needed)
- Shows a larger version of the image (~200x200px) in a rounded card with a subtle shadow
- Appears with a smooth fade + scale animation
- Positioned above the thumbnail, centered
- Disappears when mouse leaves

### Technical Details

**File: `src/components/landing/HowItWorks.tsx`**

- Add a `HoverPreview` inline component that wraps each formula thumbnail
  - Uses `useState` for hover state and `onMouseEnter`/`onMouseLeave`
  - Renders an absolutely-positioned enlarged image card on hover
  - Smooth CSS transition (`opacity`, `scale`, `pointer-events`)
- Replace the 4 static `div` + `img` blocks in Step 2 with the `HoverPreview` wrapper
- Update imports to point to the 4 newly generated images

**New assets to generate (overwriting existing):**
- `src/assets/hero/hero-product-croptop.jpg` -- product flatlay
- `src/assets/hero/hero-model-blonde.jpg` -- blonde model portrait in white tee
- `src/assets/hero/hero-scene-yoga.jpg` -- empty yoga studio
- `src/assets/hero/hero-result-yoga-blonde.jpg` -- composite result

All 4 images will be generated via an edge function using `google/gemini-3-pro-image-preview` for best quality, then saved as static assets.
