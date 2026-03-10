

## Improve the Generating State Visual — Show Actual Model & Product

### Problem
The grey circle with a generic `User` icon during generation is a placeholder that conveys no useful information. The system already has the selected model photo and product image available — we should show them.

### Design
Replace the static grey circle + User icon with a more engaging visual that shows:
- **For Virtual Try-On / model workflows**: The selected model's photo overlapping with the product thumbnail (two overlapping circles, model larger behind, product smaller in front-right)
- **For product-only workflows**: The product thumbnail in the pulsing circle
- **For Interior/Staging**: The uploaded room image in the pulsing circle

This creates a visual "merging" effect that reinforces what's happening ("we're combining these").

### Changes — 1 file

**`src/pages/Generate.tsx`** (lines 3510-3512)

Replace the current icon block:
```tsx
<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-subtle">
  {generationMode === 'virtual-try-on' ? <User /> : <Image />}
</div>
```

With a composite thumbnail display:
- If `selectedModel?.image_url` exists (try-on/model workflows): show model photo (64px circle) with product image (40px circle) overlapping bottom-right, both with a subtle pulsing ring animation
- If only product exists: show product image in the 64px circle
- Fallback to current icon if no images available
- Add a subtle CSS ring animation around the outer circle to indicate processing

