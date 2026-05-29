## Goal

Clean up the AVOID line injected at the end of every product image prompt.

## Changes

### 1. Update the Product Visuals workflow AVOID value (database)
In `workflows.negative_prompt_additions` for workflow `Product Visuals` (id `4bb79966-42f1-4720-af45-183aa954e8e1`):

From:
> No watermarks, no text overlays, no chromatic aberration, no warped product edges, no duplicated products.

To:
> Do not add watermarks, text overlays, artificial graphics, duplicated products, warped product edges, distorted shapes, chromatic aberration, lens flare, color banding, oversaturation, or visible AI artifacts.

### 2. Remove the hardcoded suffix (edge function)
In `supabase/functions/generate-workflow/index.ts` line 624, drop `, reference background, original background, source image background` from both branches. The BACKGROUND ISOLATION (CRITICAL) block above already enforces this much more clearly.

Result — final AVOID line becomes simply:
> AVOID: Do not add watermarks, text overlays, artificial graphics, duplicated products, warped product edges, distorted shapes, chromatic aberration, lens flare, color banding, oversaturation, or visible AI artifacts.

### Scope

Only Product Visuals workflow's negatives + the shared suffix. Other workflows (Virtual Try-On, Product Listing, Mirror Selfie, Selfie/UGC) keep their own `negative_prompt_additions` untouched.
