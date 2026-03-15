

## Update Picture Perspectives Carousel with Salt Flat Fashion Images

### What
Replace the current HA Cream product images in the Picture Perspectives workflow card with the uploaded salt flat fashion editorial images (4 angles: front, close-up, left side, back, right side — pick 4 best). Update the overlay badges to say "1 Photo, 4 Angles" instead of showing a product chip with "HA Cream."

### Images to use
From the 5 uploaded images, select 4 for the carousel (matching the current 4-slide structure):
1. **Front** — `Environment-a5ce06bd_2.png` (full front view)
2. **Left Side** — `Picture_Perspectives_—_Left_Side-43481ef1.png`
3. **Back** — `Picture_Perspectives_—_Back_Angle-951024d6.png`
4. **Right Side** — `Picture_Perspectives_—_Right_Side-a9888d7d.png`

Copy these to `public/images/perspectives/` with clean names, optimized for web.

### Element changes
- Remove the `product` chip element (no more "HA Cream" floating card)
- Change badge from `"4 Angles"` to `"1 Photo, 4 Angles"` with a Sparkles icon
- Add a second badge: `"One Click"` positioned bottom-right

### Also fix
The screenshot shows a broken image icon (top-left of the card) — this is likely the `listingProduct` image reference used in the product chip. Removing the product chip element fixes this.

### Files

| File | Change |
|------|--------|
| `public/images/perspectives/` | Copy 4 uploaded images here |
| `src/components/app/workflowAnimationData.tsx` | Update `'Picture Perspectives'` entry: new local background paths, remove product element, update badge text |

