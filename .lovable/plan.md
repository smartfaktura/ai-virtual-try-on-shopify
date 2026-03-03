

## Fix: Product + Reference Image Generation Quality

### Root Cause

Two issues are causing poor results when both a product and reference image are provided:

1. **Wrong AI model**: When the job goes through the queue (`isQueueInternal = true`), the model selection always falls to `google/gemini-2.5-flash-image` (line 754-755) — regardless of how many reference images are present. The flash model struggles with multi-image instructions, often reproducing the reference image instead of compositing the product into it. The pro model (`gemini-3-pro-image-preview`) is only used when a model/person image is present.

2. **Weak prompt differentiation**: The condensed prompt path (lines 130-136) instructs the AI about both images, but the instruction to "keep the product identity from [PRODUCT IMAGE]" isn't emphatic enough for the flash model. The AI often latches onto the reference image and ignores or under-represents the product.

### Fix

**`supabase/functions/generate-freestyle/index.ts`** — 2 changes:

1. **Upgrade model selection** (lines 750-758): When both `productImage` AND `sourceImage` are present (multi-reference product task), use `gemini-3-pro-image-preview` instead of flash — same as model-image tasks. This ensures the AI can properly handle two distinct images with different roles.

```
// Current: always flash for queue-internal
isQueueInternal ? "google/gemini-2.5-flash-image"

// Fixed: pro when both product + reference are present
const hasDualProductRef = !!body.productImage && !!body.sourceImage;
const aiModel = (hasModelImage || hasDualProductRef)
  ? "google/gemini-3-pro-image-preview"
  : isQueueInternal
    ? "google/gemini-2.5-flash-image"
    : ...
```

2. **Strengthen condensed prompt** (lines 130-136): Add explicit ordering and emphasis so the AI treats the product as the hero and the reference as background/style guidance only.

Update the reference instruction to be more explicit:
- "Do NOT reproduce or recreate [REFERENCE IMAGE]. It is ONLY for setting/mood/style inspiration."
- "The final image must prominently feature the exact product from [PRODUCT IMAGE] as the hero subject."

### Files changed — 1
- `supabase/functions/generate-freestyle/index.ts`

