

## Fix: Align Freestyle Quality with Virtual Try-On

### Root Cause Analysis

The Virtual Try-On function produces great results because it uses a **short, clear, structured prompt** (~20 lines). The Freestyle function produces worse results because:

| Issue | Freestyle | Try-On |
|-------|-----------|--------|
| Prompt length | 50-80+ lines | ~20 lines |
| Conflicting instructions | Multiple competing layers | Single clear structure |
| Single-ref product text | Still says "100% fidelity -- identical" (copy-paste language) | N/A |
| Photography DNA | 8-line technical block (ISO, f-stop, etc.) | 1-line "Shot on Canon EOS R5, 85mm f/1.4" |
| Model selection | Always flash for queue | Flash (but simpler prompt works) |

### Solution: Simplify and Focus the Freestyle Prompt

Adopt the Try-On's philosophy: **short, structured, direct instructions** instead of layered essay-style prompts.

### Changes

#### 1. `supabase/functions/generate-freestyle/index.ts` -- Simplify multi-ref prompt (lines 111-158)

Replace the current condensed multi-ref builder with a Try-On-style structure:

**Before:** Long paragraphs with "Re-render it naturally within the scene..." and separate quality blocks.

**After:** Numbered requirements, concise language, matching Try-On's pattern:

```text
Professional photography: {user prompt}

REQUIREMENTS:
1. PRODUCT: The item must match [PRODUCT IMAGE] in design, color, and material. 
   Show it naturally in the scene with correct lighting and shadows.
2. MODEL: The person must be the exact individual from [MODEL IMAGE] -- same face, 
   hair, skin tone, body. Ignore any person in the product image.
3. SCENE: Use [SCENE IMAGE] as the environment. Consistent lighting and perspective 
   throughout.

Quality: Photorealistic, natural skin texture, no AI artifacts, ultra high resolution.

Do NOT include: {negatives}
```

Total: ~15 lines instead of 50+.

#### 2. Fix single-ref product text (line 215)

Replace the old "100% fidelity -- identical shape, color, texture" copy-paste language:

| Before | After |
|--------|-------|
| "reproduced with 100% fidelity -- identical shape, color, texture, branding, and proportions. Do not modify, stylize, or reinterpret the product in any way." | "The product must match the reference image in design, color, and material. Show it naturally with correct lighting and shadows -- it should look photographed, not composited." |

#### 3. Simplify Photography DNA (lines 71-79)

Replace the 8-line technical block with a concise 1-2 line quality instruction (like Try-On uses):

| Before | After |
|--------|-------|
| LENS: shot on 50mm at f 2.8, ISO 400... LIGHTING ARCHITECTURE: Large soft key... MICRO-TEXTURE REALISM: Render premium... TONAL CONTROL: Rich blacks... COMPOSITION: Clean silhouette... FINISHING: Luxury editorial... | "Shot on 85mm f/1.4 lens, fashion editorial quality. Professional studio lighting, natural skin texture, ultra high resolution." |

#### 4. Use Pro model when model image is present (lines 594-598)

Update model selection so character identity is preserved:

| Before | After |
|--------|-------|
| Queue-internal: always flash | Queue-internal + model image: use pro. Otherwise: flash |

Also increase timeouts in both `generate-freestyle` (line 398: 50s to 90s) and `process-queue` (line 31: 55s to 95s, line 68: 45s to 100s) to accommodate the slower pro model.

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-freestyle/index.ts` | Simplify multi-ref prompt to Try-On style; fix single-ref product text; condense Photography DNA; use pro model when model image present; increase timeout |
| `supabase/functions/process-queue/index.ts` | Increase downstream call timeout and max runtime for pro model |

### Expected Result

Freestyle prompts will be short and focused like Try-On's, eliminating the instruction overload that confuses the AI model. Combined with using the pro model for character references, results should match Try-On quality.

