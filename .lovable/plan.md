

## Fix: Model Identity Confusion in Freestyle Generation

### Problem

When a user selects both a product image (which may contain a person/model) and a separate model from the model picker, the AI uses the person from the product image instead of the selected model. This happens because:

1. The condensed multi-ref prompt (line 103) says "Create a photorealistic image combining the provided references" -- too vague
2. The model identity instruction doesn't explicitly say "IGNORE any person in the product image"
3. Try-on works because its prompt opens with: "Create a professional fashion photograph combining **the person from [MODEL IMAGE]** wearing **the clothing item from [PRODUCT IMAGE]**" -- crystal clear from the first sentence

### Solution

Two changes in `supabase/functions/generate-freestyle/index.ts`:

#### 1. Strengthen the condensed multi-ref prompt (lines 99-143)

Change the generic opening "Create a photorealistic image combining the provided references" to be explicit like try-on:

- When both product + model are present, open with: "Create a photorealistic image featuring the EXACT PERSON from [MODEL IMAGE] with the EXACT PRODUCT from [PRODUCT IMAGE]."
- Add explicit instruction to the PRODUCT requirement: "Use ONLY the product/garment from this image. IGNORE any person, model, or mannequin shown in the product photo."
- Add explicit instruction to the MODEL requirement: "This person is the ONLY human that should appear. Their face, hair, skin, and body MUST come from [MODEL IMAGE], NOT from any other reference image."

#### 2. Strengthen the single-ref model identity block (lines 218-241)

Add a line to the MODEL IDENTITY instruction: "If a product reference image also contains a person, IGNORE that person entirely. The generated person must match ONLY the [MODEL IMAGE] reference."

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-freestyle/index.ts` | Strengthen model vs product identity separation in both condensed multi-ref prompt and single-ref model identity block |

