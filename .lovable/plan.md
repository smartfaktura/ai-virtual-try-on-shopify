

# Fix Catalog Face Blending & Outfit Inconsistency

## Problems Identified

**1. Face blending in anchor shot**: The anchor phase sends model photo (Image 1) + product photo (Image 2) to Seedream. Despite prompt instructions to separate face from outfit, Seedream's `image_strength` blending averages the two images at pixel level, causing merged/distorted faces. The prompt says "keep face from Image 1" but the model literally blends pixel data.

**2. Inconsistent support wardrobe across shots**: The support wardrobe prompt says generic text like "neutral straight trousers" — each derivative shot independently interprets this, producing jeans in one, chinos in another, dress pants in a third. Since derivatives use the anchor image as Image 1, the anchor's actual outfit should be the source of truth, but the generic text prompt allows drift.

## Solution

### A. Faceless Anchor Strategy

Change the identity anchor to be a **body-only outfit anchor** — no face involved. This eliminates the face-blending problem entirely because:
- The anchor shot generates the product on a faceless/cropped body (neck-down)
- Derivative shots use this anchor as their outfit/styling reference (Image 1)
- The model's face photo is sent as a separate reference for face-only identity

**Changes to `src/lib/catalogEngine.ts`:**
- Rewrite `identity_anchor` prompt to generate a **neck-down, headless outfit shot**: "Full body outfit from neck down, NO face, NO head visible, cropped at collarbone, showing the complete outfit styling on a body..."
- Remove face-related instructions from the anchor prompt (FACE QUALITY, IMAGE ROLE ASSIGNMENT for anchor specifically)

**Changes to `supabase/functions/generate-catalog/index.ts`:**
- For anchor shots: send ONLY the product image (no model face image) — the anchor is now purely an outfit lock
- For derivative shots: send 3 references: [model face photo (Image 1), anchor outfit (Image 2), product (Image 3)]
- Update prompt IMAGE ROLE ASSIGNMENT for derivatives: "Image 1 = face/identity source, Image 2 = outfit/styling/pose reference, Image 3 = product detail source"
- Reduce anchor `imageStrength` further since it only needs to dress a generic body, not match a specific face

### B. Lock Support Wardrobe via Anchor Reference

Since derivatives now receive the anchor image as a visual reference, add explicit prompt language:
- "Replicate the EXACT outfit shown in Image 2 — same trousers/pants, same shoes, same top styling. Do NOT change any support clothing items."
- Remove generic support wardrobe text from derivative prompts — replace with "wearing the exact same outfit as shown in Image 2"

**Changes to `src/lib/catalogEngine.ts` (`assemblePrompt`):**
- When `renderPath` is `reference_generate` (derivatives), replace `[SUPPORT_WARDROBE]` with "wearing the EXACT same complete outfit as shown in Image 2 (the reference image) — same pants, same shoes, same top, same styling, do NOT substitute or change any clothing item"
- Keep `[SUPPORT_WARDROBE]` text only for the anchor shot where it's needed to initially define the outfit

### C. Update Derivative Prompt Image Role Assignment

Update the IMAGE ROLE ASSIGNMENT block in `assemblePrompt` to differentiate between anchor and derivative shots:

**Anchor shot (no face):**
```
- Image 1 (PRODUCT IMAGE): Apply this garment onto a headless body mannequin form.
- Generate neck-down only, NO head, NO face.
```

**Derivative shots (3 images):**
```
- Image 1 (MODEL FACE): IDENTITY source — use this person's exact face, hair, skin.
- Image 2 (ANCHOR OUTFIT): OUTFIT source — replicate this exact outfit, styling, shoes, accessories.
- Image 3 (PRODUCT): PRODUCT detail reference for color/texture accuracy.
```

## Files to modify

| File | Changes |
|------|---------|
| `src/lib/catalogEngine.ts` | Rewrite `identity_anchor` prompt to faceless/headless; update `assemblePrompt` to differentiate anchor vs derivative IMAGE ROLE blocks; replace support wardrobe in derivatives with anchor-reference language |
| `supabase/functions/generate-catalog/index.ts` | Change reference image ordering: anchor=product-only, derivatives=3-image [face, anchor, product]; adjust `imageStrength` for new strategy |

## Expected Results
- No more face blending — anchor has no face to blend
- Consistent outfits — derivatives visually reference the anchor's actual generated outfit instead of interpreting generic text
- Same support wardrobe (pants, shoes) across all shots in a batch

