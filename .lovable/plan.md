

# Make "New" Card Clearer About Image Upload

## Change — `src/components/app/product-images/ProductImagesStep1Products.tsx`

Update the "New" card content to visually communicate "upload an image":

1. **Replace `Plus` icon with `Upload` icon** (from lucide-react) — immediately signals "upload" action
2. **Change label** from "New" → "Upload Image"
3. **Change subtitle** from "Upload or import" → "or paste / import URL"
4. **Add a subtle cloud-upload visual cue** — small dashed inner border or upload arrow to reinforce the action

This is a ~5 line text/icon swap, no structural changes needed.

