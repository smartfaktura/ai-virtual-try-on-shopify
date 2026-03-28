

# Reorder Try-On Fallback: Pro → Seedream → Flash

## Change
Swap the fallback order so Seedream (via ARK API) is tried immediately after Pro fails, before Flash. This makes sense because:
- Seedream has different content policies than Gemini, so it's more likely to succeed for swimwear/bikini content that Pro blocks
- Flash uses the same Gemini content filter as Pro, so it's likely to fail for the same reasons

## File: `supabase/functions/generate-tryon/index.ts`

**Lines 704-725** — swap the two fallback blocks:

```typescript
// Fallback tier 1: if Pro returned null, try Seedream 4.5 via ARK API (different content policy)
if (base64Url === null) {
  const arkApiKey = Deno.env.get("BYTEPLUS_ARK_API_KEY");
  if (arkApiKey) {
    console.warn(`Pro model returned null — falling back to Seedream 4.5 via ARK API for image ${i + 1}`);
    const refImages = [body.product.imageUrl, body.model.imageUrl, body.pose?.imageUrl].filter(Boolean) as string[];
    const seedreamResult = await generateImageSeedream(
      variationPrompt, refImages, "seedream-4-5-251128", arkApiKey, body.aspectRatio || "1:1"
    );
    if (seedreamResult.ok && seedreamResult.imageUrl) {
      base64Url = await fetchImageAsBase64(seedreamResult.imageUrl);
    } else {
      console.warn(`Seedream fallback failed:`, seedreamResult.error);
    }
  }
}

// Fallback tier 2: if Seedream also failed, try Flash as last resort
if (base64Url === null) {
  console.warn(`Seedream returned null — falling back to gemini-3.1-flash-image-preview for image ${i + 1}`);
  base64Url = await generateImageWithModel(variationPrompt, body.product.imageUrl, body.model.imageUrl, LOVABLE_API_KEY, body.aspectRatio || "1:1", "google/gemini-3.1-flash-image-preview", body.pose.imageUrl);
}
```

Everything else stays the same — just the order of the two fallback blocks is swapped.

