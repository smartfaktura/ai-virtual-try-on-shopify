

## Fix: Enforce Aspect Ratio in Generated Images

### Problem
When a user selects 1:1 (or any specific aspect ratio), the generated image sometimes comes back in a different ratio (e.g., portrait with white borders). This happens because:

1. The prompt text says `"Output aspect ratio: 1:1"` which is too weak -- the AI model often ignores it for fashion/model shots
2. While `image_config: { aspect_ratio: "1:1" }` is sent to the API, Gemini image models don't always respect this parameter reliably
3. There's no explicit pixel dimension or strong compositional instruction to enforce the ratio

### Solution
Strengthen aspect ratio enforcement in the `generate-freestyle` edge function with two changes:

### 1. Replace weak aspect ratio text with explicit dimension and composition instructions

In `supabase/functions/generate-freestyle/index.ts` (line 451), replace the simple text:
```
Output aspect ratio: ${body.aspectRatio}
```
with a strong, explicit instruction that maps each ratio to pixel dimensions and composition rules:

```
MANDATORY OUTPUT FORMAT: This image MUST be exactly ${ratio} aspect ratio (${width}x${height} pixels).
Do NOT add borders, padding, letterboxing, or pillarboxing.
The subject must fill the entire ${ratio} frame with no empty/white margins.
```

The mapping will be:
- 1:1 -> 1024x1024
- 3:4 -> 768x1024
- 4:5 -> 816x1020
- 9:16 -> 576x1024
- 16:9 -> 1024x576

### 2. Keep the existing `image_config` API parameter as a secondary enforcement

The `image_config: { aspect_ratio }` parameter already sent on line 276 will remain as a belt-and-suspenders approach.

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-freestyle/index.ts` | Replace weak aspect ratio prompt text (line 451) with explicit dimension and anti-border instructions |

### Why This Works
- Explicit pixel dimensions give the model an unambiguous target
- "No borders/padding/letterboxing" prevents the white-border workaround the model uses when it generates a portrait image inside a square canvas
- "Fill the entire frame" prevents the model from composing a portrait shot centered in a wider frame
