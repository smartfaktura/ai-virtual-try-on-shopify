

# Fix: Remove Invalid Gemini imageConfig Fields Causing 400 Errors

## Root Cause
The error is NOT caused by prompt-only scenes. The logs show clearly:

```
Unknown name "personGeneration" at 'generation_config.image_config': Cannot find field.
Unknown name "outputOptions" at 'generation_config.image_config': Cannot find field.
Unknown name "numberOfImages" at 'generation_config.image_config': Cannot find field.
```

These three fields were added in the last update but are rejected by `gemini-3-pro-image-preview`. Every Gemini call returns HTTP 400, forcing Seedream fallback. The prompt-only scene coincidence was just timing — it would fail with any scene.

## Fix

Strip the three unsupported fields from `imageConfig` in all four generation functions. Keep only the two confirmed-working fields: `aspectRatio` and `imageSize`.

### Files to update

**1. `generate-freestyle/index.ts`** (~lines 747-758)
```typescript
const imageConfig: Record<string, unknown> = {};
if (aspectRatio) imageConfig.aspectRatio = aspectRatio;
imageConfig.imageSize = quality === 'high' ? "2K" : "1K";
const generationConfig: Record<string, unknown> = {
  responseModalities: ["IMAGE", "TEXT"],
  temperature: 1.0,
  imageConfig,
};
```

**2. `generate-workflow/index.ts`** — same pattern, `imageSize: "2K"`

**3. `generate-tryon/index.ts`** — same pattern, `imageSize: "2K"`

**4. `generate-workflow-preview/index.ts`** — same pattern, `imageSize: "1K"`

Remove `personGeneration`, `outputOptions`, and `numberOfImages` from all four files.

