

# Strengthen Model Face Reference & Fix Two-Face Merge

## Problem
- **Anchor shots**: Model identity image is sent only once alongside the product image. Seedream doesn't prioritize it strongly enough → weak face detail.
- **Derivative shots**: System sends `[model_identity, product, anchor]` — **3 images, 2 with faces**. Seedream tries to merge both faces → the "two faces" artifact.

## Fix (single file change)

### `supabase/functions/generate-catalog/index.ts` — reference image logic (lines 353-363)

**Anchor shots** (no `anchor_image_url`): Send the model identity URL **twice** as the first two references, then product. This doubles the face signal strength for Seedream, ensuring it locks onto facial features with high fidelity.

**Derivative shots** (has `anchor_image_url`): Send `[anchor, product]` **only**. Drop the raw model identity entirely — the anchor already contains the locked face. This eliminates the competing face references that cause the merge artifact.

```text
Current (all on-model shots):
  [model_identity, product, anchor?]  ← 2 faces when anchor present

After fix:
  Anchor shot:      [model_identity, model_identity, product]  ← 2× face strength
  Derivative shot:  [anchor_result, product]                   ← single face source
```

No other files need changes.

