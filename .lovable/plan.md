

## Improve Multi-Product Flat Lay Rendering

### Problem
The flat lay workflow code correctly sends multiple product reference images and prompt instructions, but the AI model (Flash tier by default) struggles to reliably render all selected products. The Pro model handles multiple reference images significantly better.

### Root Cause
For standard quality flat lays, the system uses `google/gemini-3.1-flash-image-preview`. This model is weaker at compositing multiple distinct reference images into one scene. The Pro model (`google/gemini-3-pro-image-preview`) is already forced for model-based workflows and interior design — the same should apply to multi-product flat lays.

### Changes

**File: `supabase/functions/generate-workflow/index.ts` (~line 870-874)**

After the existing Pro model force for interior design, add a force for multi-product flat lays:

```ts
// Force Pro model for multi-product flat lay (multiple reference images need highest fidelity)
if (body.additional_products?.length) model = "google/gemini-3-pro-image-preview";
```

This one-line addition ensures that whenever 2+ products are selected for a flat lay, the Pro image model is used — which is substantially better at preserving multiple distinct product identities from reference images.

### Technical Note
The prompt construction, reference image passing, and product filtering are all correctly implemented. This is purely a model quality issue — Flash deprioritizes secondary reference images while Pro handles them reliably.

