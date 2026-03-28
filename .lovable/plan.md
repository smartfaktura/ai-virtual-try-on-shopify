# Add Seedream Fallback for Content-Policy Rejections in Try-On

## Problem

When generating bikini/swimwear try-on images, Gemini Pro returns `IMAGE_PROHIBITED_CONTENT` and `null`. The current fallback chain (Pro → Flash) doesn't help because Flash has the same content policy. All 3 Pro retries fail, Flash also fails, and the job ends as "failed" with full credit refund.

## Solution

Add a second fallback tier using ByteDance Seedream 5.0 Lite (`bytedance/seedream-5.0-lite`) which has more permissive content policies for legitimate fashion/swimwear photography. The chain becomes:

```text
Gemini Pro (3 retries) → Gemini Flash (3 retries) → Seedream 5.0 Lite (3 retries)
```

## Changes

### File: `supabase/functions/generate-tryon/index.ts`

In the main generation loop (lines 606-645), after the Flash fallback at line 618, add a Seedream fallback:

```typescript
// Existing: Pro model returned null → try Flash
if (base64Url === null) {
  console.warn(`Pro model returned null — falling back to gemini-3.1-flash-image-preview for image ${i + 1}`);
  base64Url = await generateImageWithModel(..., "google/gemini-3.1-flash-image-preview", ...);
}

// NEW: Flash also returned null → try Seedream (handles content-policy rejections)
if (base64Url === null) {
  console.warn(`Flash model also returned null — falling back to Seedream for image ${i + 1}`);
  base64Url = await generateImageWithModel(..., "bytedance/seedream-3.0", ...);
}
```

Seedream uses the same OpenAI-compatible API format through the Lovable AI gateway, so no changes to `generateImageWithModel` are needed — it already accepts arbitrary model strings.

### Aspect ratio note

Per the existing memory on Seedream, 4:5 ratio may need mapping to 3:4. We should add ratio mapping inside `generateImageWithModel` when the model is Seedream-based, storing `actualAspectRatio` if needed. However, since try-on jobs already support multiple ratios and Seedream 3.0 supports common ratios, we'll add a lightweight mapping only if needed. (Please do it!)

## Files changed

- `supabase/functions/generate-tryon/index.ts` — add Seedream as third fallback tier after Flash