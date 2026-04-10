

# Fix: Reference Image Ordering in Gemini Prompt

## Problem
The reference image `inlineData` part is placed **after** the text prompt in the `nativeParts` array. Gemini's multi-modal generation performs better when the image context comes **before** the text instruction — the model processes parts sequentially and having the image first lets it "see" the reference before reading what to do with it.

## Change — `supabase/functions/generate-text-product/index.ts`

### Reorder parts: image first, then text
In `generateImageGemini` (line 61-64), swap the order so reference image parts come before the text prompt:

```typescript
const nativeParts: Record<string, unknown>[] = [
  ...(referenceParts || []),  // image FIRST — model sees reference before instructions
  { text: prompt },
];
```

This is a one-line change that ensures the model processes the visual reference before reading the generation instructions, which significantly improves adherence to the reference image's shape, style, and silhouette.

## File Changed
| File | Change |
|------|--------|
| `supabase/functions/generate-text-product/index.ts` | Swap ordering: reference image parts before text prompt in `nativeParts` array |

