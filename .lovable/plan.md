

## Upgrade to Pro Model for Person-Based Workflows

### Problem

Both **Virtual Try-On** and **Selfie / UGC Set** involve a model (person) reference image, but neither automatically uses the higher-fidelity Pro model (`google/gemini-3-pro-image-preview`) for identity preservation:

- **Virtual Try-On** (`generate-tryon`): Hardcoded to `google/gemini-2.5-flash-image` (line 229) regardless of quality setting
- **Selfie / UGC Set** (`generate-workflow`): Uses `getModelForQuality()` which only picks Pro when quality is explicitly "high"
- **Product Listing Set** (`generate-workflow`): Same quality-based selection — no person involved, so Flash is appropriate

### Solution

1. **`generate-tryon`**: Change the hardcoded model from `google/gemini-2.5-flash-image` to `google/gemini-3-pro-image-preview`
2. **`generate-workflow`**: Override `getModelForQuality()` — when a model reference image is present (`body.model?.imageUrl`), force Pro model regardless of the quality setting

This means:
- Virtual Try-On: always Pro (person always present)
- Selfie / UGC Set: always Pro (person always present via model picker)
- Product Listing Set: stays quality-based (no person involved, Flash is fine for products)

### Changes

| File | Change |
|------|--------|
| `supabase/functions/generate-tryon/index.ts` | Line 229: change `google/gemini-2.5-flash-image` to `google/gemini-3-pro-image-preview` |
| `supabase/functions/generate-workflow/index.ts` | After line 546: if `body.model?.imageUrl` is present, override `model` to `google/gemini-3-pro-image-preview` regardless of quality setting |

### Technical Detail

```text
generate-tryon (line 229):
  Before: model: "google/gemini-2.5-flash-image"
  After:  model: "google/gemini-3-pro-image-preview"

generate-workflow (after line 546):
  Before: const model = getModelForQuality(quality);
  After:  let model = getModelForQuality(quality);
          if (body.model?.imageUrl) model = "google/gemini-3-pro-image-preview";
```

Both functions will be redeployed automatically after the changes.

