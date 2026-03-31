

# Fix: Redeploy Edge Functions with Corrected imageConfig

## Problem
The code in the repository is already correct — the three invalid fields (`personGeneration`, `outputOptions`, `numberOfImages`) were removed. However, the **deployed** edge functions still run the old code containing those fields, causing every Gemini call to return HTTP 400 and fall back to Seedream.

Evidence from logs (timestamp 12:57:59Z, AFTER the code fix):
```
Unknown name "personGeneration" at 'generation_config.image_config': Cannot find field.
Unknown name "outputOptions" at 'generation_config.image_config': Cannot find field.
Unknown name "numberOfImages" at 'generation_config.image_config': Cannot find field.
```

## Fix
Force redeployment of all four affected edge functions so the corrected code (which only uses `aspectRatio` and `imageSize`) goes live:

1. `generate-freestyle`
2. `generate-workflow`
3. `generate-tryon`
4. `generate-workflow-preview`

No code changes needed — just a redeploy to push the already-corrected code to production.

## Technical Detail
The edge functions will be redeployed using the deploy tool. The corrected `imageConfig` in all four files only contains:
```typescript
const imageConfig: Record<string, unknown> = {};
if (aspectRatio) imageConfig.aspectRatio = aspectRatio;
imageConfig.imageSize = quality === 'high' ? "2K" : "1K";
```

This is the exact configuration that was working before the invalid fields were added.

