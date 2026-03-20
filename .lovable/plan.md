

# Fix Creative Drops: Credit Mismatch & Error Handling

## What Happened

You created a "Winter" drop with 1 product, 1 Virtual Try-On workflow, 2 models (Olivia + Marcus), and 3 poses. The wizard estimated **~36 credits**, but the backend calculated **72 credits** — and you only have 2 credits, so it failed with a generic error toast.

## Root Cause: Double-Counting Models

The wizard computes `computedImageCount = poses(3) × models(2) = 6`, then stores `scene_config.image_count = 6`. But `trigger-creative-drop` reads that 6 AND also loops `for (const model of modelList)` (2 models), creating 2 separate jobs of 6 images each = 12 images total × 6 credits = **72**. Models are counted twice.

## 3 Bugs to Fix

### Bug 1: Backend double-counts models (CRITICAL)
`trigger-creative-drop` iterates per-model AND uses `image_count` which already includes the model multiplier. Fix: when `image_count` is set from wizard, divide by model count to get per-model image count, OR skip the per-model loop and use a single job with the full image count.

The cleanest fix: when `scene_config.image_count` is set, it already includes models. So skip the per-model loop and send one job per product with the full `image_count`. Only loop per-model when `image_count` is NOT pre-computed.

### Bug 2: Error toast is generic
Line 559 in `CreativeDropWizard.tsx`: `res.error.message` shows "Edge Function returned a non-2xx status code" instead of the actual "Insufficient credits" message. The real error body is in `res.data`. Fix: parse `res.data?.error` and show that instead.

Same issue in `DropCard.tsx` line 110: `res.error` from `supabase.functions.invoke` doesn't contain the response body.

### Bug 3: Wizard doesn't block launch when credits are insufficient
The warning banner exists (line 1734) but there's no actual block preventing the user from clicking "Generate Now" with insufficient credits. The button should be disabled.

## Changes

| File | Change |
|------|--------|
| `supabase/functions/trigger-creative-drop/index.ts` | When `scene_config.image_count` is set, don't loop per-model (it's already factored in). Send one job per product with all models embedded. |
| `src/components/app/CreativeDropWizard.tsx` | Parse `res.data?.error` for better error messages. Disable launch button when credits insufficient. |
| `src/components/app/DropCard.tsx` | Parse `res.data?.error` from the 402 response for the "Run Now" button error toast. |

3 files, ~25 lines changed.

