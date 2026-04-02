

# Fix Face Quality & Cross-Shot Consistency in Catalog Studio

## Root Cause

The system fires ALL jobs (anchor + derivatives) simultaneously with `anchorImageUrl: null`. The anchor-then-derivatives architecture exists in the code but **never actually chains** — derivative shots never receive the anchor result as a consistency reference. Each shot generates independently, causing:

- Face drift between shots (Seedream reinvents the face each time)
- The "two faces" artifact in your screenshots — without an anchor to lock identity, Seedream interprets the model + product references inconsistently

Additionally, the model reference image is converted to base64 client-side (`safeConvertBase64`), which can degrade the image before it even reaches Seedream.

## Fix: Two-Phase Generation Pipeline

### 1. Two-phase enqueue in `useCatalogGenerate.ts`

Instead of firing all jobs at once, split into two phases:

**Phase 1 — Anchor jobs**: Enqueue only anchor shots. Start polling. Wait until all anchors complete.

**Phase 2 — Derivative jobs**: Once an anchor completes, read its result image URL from the poll data. Enqueue derivative shots for that product/model combo WITH `anchor_image_url` set to the completed anchor's storage URL.

This means derivatives get a real generated image as their consistency reference — Seedream can then match the exact face, lighting, and styling from the anchor.

### 2. Skip base64 conversion for model images — pass URL directly

Currently: `modelB64 = await safeConvertBase64(model.imageUrl)` → sends a potentially degraded base64 blob.

Change: Pass the original URL string directly in the payload. The edge function already accepts URLs (Seedream takes URLs natively). Only convert the product image to base64 if needed for the enqueue payload, or better yet, pass URLs for both.

This preserves full resolution of the model's face reference.

### 3. Edge function: stronger single-identity instruction

In `generate-catalog/index.ts`, when building the Seedream request body for on-model shots, add an explicit `seed` parameter derived from the batch_id. This ensures Seedream uses the same random seed across all shots in a batch, improving face consistency.

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useCatalogGenerate.ts` | Two-phase pipeline: enqueue anchors first, wait for completion, then enqueue derivatives with anchor URL. Skip base64 for model images — pass URL directly. |
| `supabase/functions/generate-catalog/index.ts` | Add deterministic `seed` from batch_id for cross-shot consistency. |

## How It Works After the Fix

```text
Phase 1: Enqueue anchor jobs (1 per product×model)
         ↓ poll until anchors complete
Phase 2: Read anchor result URLs
         ↓ enqueue derivatives WITH anchor_image_url = anchor result
         ↓ Seedream gets: [model_identity, product, anchor_result]
         → Face locked from anchor, consistent across all shots
```

