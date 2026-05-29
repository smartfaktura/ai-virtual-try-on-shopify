# Trim redundant always-on negatives + improve PERSON_NEGATIVES

## 1. Trim redundant negatives

About 60% of `BASE_NEGATIVES` + `PRODUCT_NEGATIVES` duplicates `CRITICAL REQUIREMENTS` already added by `supabase/functions/generate-workflow/index.ts` (lines 615-625). Repeating instructions as negatives wastes tokens and can trigger negative-prompt bias on Gemini/Seedream.

| Always-on phrase | Already covered by | Verdict |
|---|---|---|
| "Preserve all original product branding, logos, and label text exactly as shown" | CRITICAL #2 + #3 | Remove |
| "No background from reference image, no original product photo environment" | CRITICAL #7 + tail AVOID | Remove |
| "no over-saturation, no color banding, no chromatic aberration, no lens flare artifacts" | CRITICAL #4 ("no AI artifacts") | Remove |
| "No watermarks, no artificial text overlays" | Nothing upstream | Keep |
| "No warped product edges, no melted/distorted labels, no duplicated products, no floating elements" | Nothing upstream | Keep |

### Change (lines 230-232)

```ts
const BASE_NEGATIVES = 'No watermarks, no artificial text overlays.';
const PERSON_NEGATIVES = 'Keep the person anatomically natural and realistic: correct hands, fingers, nails, limbs, joints, posture, and body proportions.';
const PRODUCT_NEGATIVES = 'No warped product edges, no melted or distorted labels, no duplicated products, no floating elements.';
```

## 2. Improve PERSON_NEGATIVES

Old: `No extra fingers, no distorted joints, no unnatural hand anatomy, no missing limbs, no fused fingers, no deformed nails, correct human proportions.`

New: `Keep the person anatomically natural and realistic: correct hands, fingers, nails, limbs, joints, posture, and body proportions.`

Why: Positive framing ("keep correct") outperforms negative framing ("no extra") on modern diffusion models. Stating what TO do reduces negative-prompt bias while covering the same failure modes.

## Effect
- ~55 fewer tokens per prompt across all variations and jobs.
- No duplicate branding/background isolation phrasing.
- Real safety guards still in place (watermark, melted labels, duplicates, floating).
- PERSON_NEGATIVES becomes positively framed and anatomically comprehensive.

## Out of scope
`BG_COLOR_NEGATIVES`, edge-function CRITICAL text, camera/focus/lighting maps remain unchanged.