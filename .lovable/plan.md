

# Fix Catalog: Send Anchor Image as Visual Reference for Derivatives

## The Real Problem

You're correct — the anchor image already shows the model wearing the correct product with correct colors/style. But derivative shots never actually SEE the anchor image. Here's the current flow:

```text
Anchor shot:    product image → generates model wearing product ✓
Derivative:     model identity image ONLY → text says "wear X" → AI guesses outfit ✗
```

The `anchor_image_url` is sent in the payload but only used as a boolean gate (line 433: `else if (body.anchor_image_url)`) to pick the code path. The actual visual reference sent to Gemini is only the model identity portrait. The AI then relies on text like `OUTFIT FROM TEXT: "product title"` to guess the outfit — which fails for colors, patterns, and textures.

## Fix: Use Anchor as Primary Reference, Model Identity as Secondary

### File 1: `supabase/functions/generate-catalog/index.ts` (lines 433-447)

Change derivative on-model logic to send TWO images:
- Image 1: The **anchor image** (model wearing the correct product — this is the strongest visual reference)
- Image 2: The **model identity image** (for face consistency backup)

For texture-only shots (`detail_closeup`, `zoom_detail`, `hands_detail`) that don't need a face, send only the product image.

```typescript
} else if (body.anchor_image_url) {
  // ── DERIVATIVE ON-MODEL: DUAL-REFERENCE (anchor + identity) ──
  const TEXTURE_ONLY_SHOTS = ['detail_closeup', 'zoom_detail', 'hands_detail'];
  if (TEXTURE_ONLY_SHOTS.includes(body.shot_id || '')) {
    // Texture shots: product image only, no face needed
    referenceImages.push(body.product.imageUrl);
  } else if (modelIdentityUrl) {
    referenceImages.push(body.anchor_image_url);  // Image 1: anchor (correct outfit + model)
    referenceImages.push(modelIdentityUrl);         // Image 2: identity backup
  } else {
    // fail fast (existing logic)
  }
}
```

### File 2: `src/lib/catalogEngine.ts` (lines 813-822)

Update IMAGE ROLE ASSIGNMENT for derivative on-model shots:

**Replace** the current single-reference text with dual-reference roles:
- Image 1 (ANCHOR REFERENCE): The model wearing the exact product. Replicate this outfit, colors, textures, and product appearance with 100% fidelity. This is the primary visual truth.
- Image 2 (IDENTITY BACKUP): Face/identity source for maximum face consistency.

**Remove** the `OUTFIT FROM TEXT` block — the anchor image now carries that information visually.

**Update ghost mannequin prompts**: Add explicit "interior must be PURE WHITE (#FFFFFF), not black, not shadowed" instruction to the ghost_mannequin prompt template and its category overrides.

**Update detail close-up prompts**: Add "Reproduce the EXACT product from the reference image — same colors, textures, patterns, stitching. Do NOT invent or alter any detail."

### Summary

| Change | Why |
|--------|-----|
| Send anchor as Image 1 to derivatives | AI sees the actual outfit instead of guessing from text |
| Send model identity as Image 2 | Face consistency backup |
| Product-only for texture shots | No face needed, maximum texture fidelity |
| Ghost mannequin white interior | Prevent black/dark interior rendering |
| Detail close-up fidelity text | Prevent texture invention |

