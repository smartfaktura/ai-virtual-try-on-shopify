## Smarter product size analysis + suppress when dimensions exist

The current `sizeClass: small | medium | …` is too coarse: a 14mm ring and a 24mm ring are both "very-small", a 30cm clutch and a 60cm tote are both "medium". We replace the single bucket with a **numeric, category-aware size estimate** the renderer can use as a real scale anchor.

---

### 1. Analyzer — `supabase/functions/analyze-product-category/index.ts`

Replace the single `sizeClass` field with a small structured size object. The model is told to reason about size using visual cues (hand, finger, body part visible in shot, packaging, known references) **plus** category priors.

**New analyzer contract (replaces line 213 `sizeClass`):**

```
SIZE ESTIMATION (always return — this is the renderer's scale anchor):
- sizePrimaryCm: number — the single most defining dimension in centimeters
    (ring → inner diameter; necklace → chain length; bag → height;
     phone case → length; chair → seat height; lamp → total height;
     bottle → height; earring → drop length; watch → case diameter).
    Estimate from the image. If multiple plausible values, pick the
    median of the realistic range for this exact product type.
- sizeSecondaryCm: number | null — second defining dimension when meaningful
    (bag width, chair width, bottle diameter, lamp shade diameter).
    null if not applicable (rings, simple pendants, etc.).
- sizeBucket: very-small | small | medium | large | extra-large
    (kept for backwards-compat tokens; derive from sizePrimaryCm).
- sizeReference: short, vivid real-world comparison anchored to a body part
    or everyday object. Examples:
      "fits on a fingertip, ~16mm inner diameter"
      "sits across the collarbone, ~42cm chain"
      "fills an adult palm, ~9cm tall phone case"
      "reaches mid-thigh when worn, ~65cm tote"
      "stands knee-high, ~55cm side table"
      "taller than a person, ~210cm wardrobe"
- sizeConfidence: high | medium | low
    high = clear visual reference in shot (hand, model, ruler, packaging)
    medium = strong category prior, no in-shot reference
    low    = ambiguous; renderer should treat as soft hint

REASONING RULES the analyzer must follow:
1. Use any visible body part (hand, ear, wrist, neck, foot, full body) as
   the primary scale cue — these beat category priors.
2. Use packaging or known objects in shot (coin, phone, A4) when present.
3. Use product-type priors only as a fallback, and pick the realistic
   median for this *specific* subtype:
     - rings: 14–22 mm inner diameter
     - stud earrings: 4–12 mm; drop earrings: 15–80 mm drop
     - pendant necklaces: chain 40–80 cm
     - watches: 28–46 mm case
     - phone cases: 14–17 cm length
     - clutches: 18–28 cm; crossbody: 20–28 cm; tote: 35–45 cm
     - sneakers: 26–30 cm length
     - fragrance bottles: 8–18 cm height
     - dining chairs: seat 45 cm, total 85 cm
     - floor lamps: 140–180 cm
     - sofas: 180–240 cm width
   …extend with category as needed; the model should use its own
   knowledge for categories not enumerated.
4. Never invent precision you don't have — round to nearest 0.5 cm under
   10 cm, nearest 1 cm under 100 cm, nearest 5 cm above.
```

Add a short worked example in the prompt so the model returns the structured form consistently.

---

### 2. Edge function — `supabase/functions/generate-workflow/index.ts` (~lines 589–606)

Read the new fields. Build a single human-readable line, and **suppress it entirely when the user already provided `product.dimensions`** (their specs are authoritative).

```ts
const analysisData = (product as any).analysis;
const analysisLines: string[] = [];
if (analysisData) {
  if (analysisData.category)        analysisLines.push(`- Category: ${analysisData.category}`);
  if (analysisData.materialFamily)  analysisLines.push(`- Material: ${analysisData.materialFamily}`);
  if (analysisData.finish)          analysisLines.push(`- Finish: ${analysisData.finish}`);
  if (analysisData.colorFamily)     analysisLines.push(`- Color family: ${analysisData.colorFamily}`);

  // Size: only when user did NOT provide explicit dimensions
  if (!product.dimensions) {
    const primary   = analysisData.sizePrimaryCm;
    const secondary = analysisData.sizeSecondaryCm;
    const ref       = analysisData.sizeReference;
    const conf      = analysisData.sizeConfidence;

    if (ref || primary) {
      const dims = [primary && `${primary}cm`, secondary && `${secondary}cm`]
        .filter(Boolean).join(' × ');
      const confTag = conf === 'low' ? ' (approximate)' : '';
      analysisLines.push(`- Real-world size: ${ref || dims}${dims && ref ? ` (${dims})` : ''}${confTag}`);
    } else if (analysisData.sizeBucket) {
      // last-resort fallback only
      analysisLines.push(`- Size class: ${analysisData.sizeBucket}`);
    }
  }
}
```

So users see either:
- their own `- Dimensions: …` line (when specs provided), **or**
- `- Real-world size: fits on a fingertip, ~16mm inner diameter (1.6cm)` (when analyzer ran), **or**
- nothing extra (when analyzer has no signal).

Never both. Never bare "small".

---

### 3. Token system + types

- `src/components/app/product-images/types.ts` (line 76): widen `sizeClass` → `string` and add optional `sizePrimaryCm?: number`, `sizeSecondaryCm?: number | null`, `sizeBucket?: string`, `sizeReference?: string`, `sizeConfidence?: 'high' | 'medium' | 'low'`.
- `src/lib/productImagePromptBuilder.ts` line 1074: `{{productSize}}` token resolves to `analysis?.sizeReference || analysis?.sizeBucket || analysis?.sizeClass || 'medium'` (richer string wins, fallback chain preserves existing scenes).
- `src/hooks/useProductAnalysis.ts` lines 96/130/178: change `sizeClass: 'medium'` defaults to `sizeClass: ''` so the suppression in the edge function kicks in cleanly when analysis is missing.
- Demo data in `src/data/demoProducts.ts` keeps existing string values — still valid.

`bundlePromptBuilder.ts` `inferSizeClass()` is independent — untouched.

---

### Out of scope
- Description (already removed)
- Category / Material / Finish / Color family
- Bundle proportions system

Redeploy `analyze-product-category` and `generate-workflow`.