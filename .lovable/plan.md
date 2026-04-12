

# Fix: Product Logos Being Stripped During Generation

## Root Cause

The `BASE_NEGATIVES` string in `productImagePromptBuilder.ts` includes **"no text overlays"**, which the AI interprets broadly — including product branding, logos, and label text that are physically part of the product (like Nike swoosh text, brand names embossed on sneakers, etc.).

The freestyle edge function correctly instructs "replicate this item EXACTLY as shown" (line 538), but the negative prompt appended by the client-side prompt builder contradicts this by saying "no text overlays."

```text
Current BASE_NEGATIVES:
"No watermarks, no text overlays, no chromatic aberration, no lens flare artifacts..."
                 ^^^^^^^^^^^^^^^^
                 This causes logo removal
```

## Fix

### 1. Refine `BASE_NEGATIVES` in `productImagePromptBuilder.ts`

Change "no text overlays" to be more specific so it targets only **artificial** overlays, not product branding:

```
Before: "No watermarks, no text overlays, no chromatic aberration..."
After:  "No watermarks, no artificial text overlays or watermark text, no chromatic aberration..."
```

### 2. Add explicit logo preservation to `PRODUCT_NEGATIVES`

Append a positive reinforcement to the product negatives:

```
Before: "No warped product edges, no melted or distorted labels, no duplicated products, no floating elements. No background from reference image, no original product photo environment."
After:  "No warped product edges, no melted or distorted labels, no duplicated products, no floating elements. No background from reference image, no original product photo environment. Preserve all original product branding, logos, and label text exactly as shown."
```

### Files changed
1. `src/lib/productImagePromptBuilder.ts` — refine `BASE_NEGATIVES` and `PRODUCT_NEGATIVES` (lines 230-232)

