

# Simplify Freestyle Editor + Improve Generation Quality

## Problem

The current editor has too many chips (Upload, Product, Model, Scene, Framing, Brand, Exclude, Aspect, Quality, Camera Style) and the prompt engine produces ~800-word prompts with contradictory negative instructions that confuse Gemini Nano Banana models. Results lack realistic skin texture, sharp details, and legible product text.

## What Changes

### UI Simplification (3 chips removed)

**Remove:**
- **"Exclude" (negatives) chip** — negative prompts ("AVOID: no X") confuse Nano Banana. Positive framing produces better results.
- **"Quality: Standard/High" chip** — always use high quality. No reason to offer a worse option.
- **"Aspect Ratio" chip label** — keep the chip but it stays as-is (already clean).

**Keep (important):**
- **Camera Style (Pro / iPhone)** — stays as a first-class chip, easy to toggle. Users want this.
- Upload, Product, Model, Scene, Framing, Brand, Aspect Ratio — all stay.

**Result:** 7 chips on desktop, cleaner "More" section on mobile (Brand only).

### Prompt Engine Rewrite (backend)

Replace the current 500-line dual-path `polishUserPrompt` with a single ~100-line builder using positive framing only.

**Current problems:**
- Two code paths (condensed for 2+ refs, layered for 1 ref) that duplicate 70% of logic
- `buildNegativePrompt()` appends "AVOID: No AI skin smoothing" which triggers the model to think about smoothing
- `buildPhotographyDNA()` and `buildGenericDNA()` are generic filler
- Gender rules duplicated in both paths
- Framing duplicated in 3 places
- Prompts reach 800-1200 words — model deprioritizes later instructions

**New approach — single path, ~150-250 words max:**

```text
[Photography type]: [user prompt]

REFERENCES:
1. PRODUCT: [exact product matching instructions]
2. MODEL: [identity matching instructions]  
3. SCENE: [environment instructions]

QUALITY: Photorealistic. Natural skin with visible pores and fine lines.
Sharp micro-detail on textures, stitching, and product text/logos.
Visible material grain. Single cohesive photograph, edge-to-edge.
[Pro: Shot on 85mm f/2.8, sculpted studio lighting, subtle film grain]
[iPhone: Shot on iPhone, deep DOF, everything sharp, true-to-life colors]

[FRAMING: ...] (if selected)
[BRAND: ...] (if selected)
```

**Key quality keywords added (based on Nano Banana best practices):**
- "natural skin texture with visible pores and fine lines" (not "no AI smoothing")
- "sharp micro-detail on product text, logos, and labels" (for legible text)
- "visible material grain and stitching detail" (for textures)
- "single cohesive photograph" (not "no collage layouts")
- Camera-specific quality block based on Pro vs iPhone selection

### Model Selection Simplification

Current logic has 5 conditions. Simplify to:
- **Has model reference image → Pro** (`gemini-3-pro-image-preview`) — face matching needs Pro
- **Everything else → Flash** (`gemini-3.1-flash-image-preview`) — faster, still excellent quality
- Remove `quality === 'high'` branching (quality chip removed)

### Credit Cost Simplification

Current: 4 credits (standard) or 6 credits (high/model/scene).
New: **Always 6 credits** — always high quality. Simpler, no confusion.

## Files to Change

### 1. `supabase/functions/generate-freestyle/index.ts`
- Delete `buildNegativePrompt()`, `buildPhotographyDNA()`, `buildGenericDNA()`, `isExpertPrompt()`
- Rewrite `polishUserPrompt()` as single-path ~100-line function with positive framing
- Add skin texture, product text, and material detail keywords
- Integrate camera style (Pro vs iPhone) as positive quality block
- Simplify model selection to: hasModelImage → Pro, else → Flash
- Remove `quality` from model selection logic

### 2. `src/components/app/freestyle/FreestyleSettingsChips.tsx`
- Remove `NegativesChip` import and rendering (both mobile and desktop)
- Remove `qualityChip` rendering (both mobile and desktop)
- Remove quality/negatives from props interface
- Move Brand chip from "More" collapsible into main chip row (desktop already has it; mobile moves it out of collapsible)
- Remove the "More" collapsible entirely (nothing left in it)

### 3. `src/components/app/freestyle/FreestylePromptPanel.tsx`
- Remove negatives, quality props from interface and passthrough

### 4. `src/pages/Freestyle.tsx`
- Remove `negatives` state and setter
- Remove `quality` state — hardcode to `'high'` in payload
- Simplify `creditCost` to always be 6
- Remove negatives/quality from `handleReset`, `isDirty`, and `queuePayload`

## What Does NOT Change
- Camera Style chip (Pro/iPhone) — stays, user wants it
- Image Role Selector (edit/product/model/scene) — stays
- Queue system, credits flow, storage — unchanged
- Framing, Brand, Product, Model, Scene selectors — unchanged
- Edit intent system — unchanged

## Risk
Medium — prompt rewrite affects output quality. But current prompts are objectively too long and use negative framing which Google's own docs say hurts Nano Banana. The new approach follows their recommended pattern. Camera style remains user-controllable.

