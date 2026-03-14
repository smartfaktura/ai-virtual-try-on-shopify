

## Black Border Around Generated Images — Analysis & Fix

### Root Cause

The black borders are an **AI model artifact**, not a rendering or CSS issue. Here's the mechanism:

1. The generation prompt includes `Output aspect ratio: 4:5` as text instruction (line 860)
2. The API call also passes `image_config: { aspect_ratio: "4:5" }` (line 515)
3. When the Gemini model generates an image whose native dimensions don't perfectly match the requested ratio, it adds thin black padding (letterboxing) to force the output into the target dimensions
4. This is especially common with the `gemini-3-pro-image-preview` model used for multi-reference generations (model + product)

### Fix — Two Changes in `generate-freestyle/index.ts`

**1. Add explicit anti-border instruction to the prompt**

Append a clear instruction to the final prompt telling the AI model to never add borders, padding, or letterboxing. This goes near line 860 where `aspectPrompt` is constructed:

```typescript
const aspectPrompt = `${finalPrompt}\n\nOutput aspect ratio: ${body.aspectRatio}. CRITICAL: The image must fill the ENTIRE canvas edge-to-edge. Do NOT add any black borders, black bars, letterboxing, pillarboxing, padding, or margins around the image. The photograph must extend to all four edges with no empty space.`;
```

**2. Add anti-border rule to the negative prompt**

In `buildNegativePrompt()` (line ~121-128), add a line explicitly forbidding borders:

```
- No black borders, black bars, letterboxing, pillarboxing, or padding around the image edges
```

### Why This Works

Gemini image models respond well to explicit negative instructions. The dual approach (positive "fill entire canvas" + negative "no borders") provides strong guidance. The `image_config` API parameter stays as-is since it correctly communicates the desired ratio to the model.

### Files to Modify

| File | Change |
|---|---|
| `supabase/functions/generate-freestyle/index.ts` | Add anti-border text to `aspectPrompt` (~line 860) and to `buildNegativePrompt()` (~line 127) |

