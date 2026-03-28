

# Fix Seedream Fallback in Try-On: Use ARK API (Same as Freestyle)

## Problem
The current Seedream fallback (lines 621-627) calls `bytedance/seedream-5.0-lite` through the **Lovable AI gateway**, which doesn't support Seedream. Meanwhile, **freestyle already uses Seedream 4.5 successfully** via the BytePlus ARK API with image inputs — the exact same pattern we need.

## Approach
Keep the existing Gemini Pro → Flash fallback chain untouched. Replace only the broken Seedream tier 2 call with a proper ARK API call, ported from `generate-freestyle`. This is a **surgical replacement** — no changes to the working generation logic.

## Changes

### File: `supabase/functions/generate-tryon/index.ts`

**1. Add Seedream helpers** (before `generateImage` function, ~line 296)

Port these from `generate-freestyle/index.ts`:
- `seedreamSizeForRatio()` — returns `"2K"`
- `seedreamAspectRatio()` — maps 4:5 → 3:4, etc.
- `SEEDREAM_MODERATION_CODES` array
- `generateImageSeedream()` — calls `https://ark.ap-southeast.bytepluses.com/api/v3/images/generations` with `BYTEPLUS_ARK_API_KEY`, supports image inputs via `body.image = imageUrls`

**2. Add URL-to-base64 helper**

Seedream returns a URL, but the tryon upload flow expects base64. Add a small helper:
```typescript
async function fetchImageAsBase64(url: string): Promise<string> {
  const resp = await fetch(url);
  const buf = new Uint8Array(await resp.arrayBuffer());
  // Use chunked btoa to avoid call stack issues with large images
  let binary = "";
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
  return `data:image/png;base64,${btoa(binary)}`;
}
```

**3. Replace the broken fallback** (lines 621-627)

Replace the Lovable gateway call with the ARK API call, passing product + model + scene images:
```typescript
if (base64Url === null) {
  const arkApiKey = Deno.env.get("BYTEPLUS_ARK_API_KEY");
  if (arkApiKey) {
    console.warn(`Flash model also returned null — falling back to Seedream 4.5 via ARK API for image ${i + 1}`);
    const refImages = [body.product.imageUrl, body.model.imageUrl, body.pose?.imageUrl].filter(Boolean) as string[];
    const seedreamResult = await generateImageSeedream(
      variationPrompt, refImages, "seedream-4-5-251128", arkApiKey, body.aspectRatio || "1:1"
    );
    if (seedreamResult.ok && seedreamResult.imageUrl) {
      base64Url = await fetchImageAsBase64(seedreamResult.imageUrl);
    } else {
      console.warn(`Seedream fallback failed:`, seedreamResult);
    }
  }
}
```

## What stays the same
- Gemini Pro generation (tier 1) — untouched
- Gemini Flash fallback (tier 2) — untouched  
- Upload, queue completion, error handling — all untouched
- Only the broken lines 621-627 are replaced

## Technical details
- `BYTEPLUS_ARK_API_KEY` secret already exists in the project
- Seedream 4.5 (`seedream-4-5-251128`) supports image-to-image via the `image` field (single URL or array)
- Aspect ratio 4:5 auto-maps to 3:4 via `seedreamAspectRatio()`
- 90s timeout on Seedream call (same as freestyle)

