

# Enhance Gemini Native API Parameters for Realistic High-Resolution Output

## Current State
All four generation functions only pass `responseModalities`, `aspectRatio`, and (freestyle only) `imageSize`. Several important parameters are missing.

## Parameters to Add

Based on the native Gemini `generateContent` API documentation:

### 1. `personGeneration: "ALLOW_ALL"` (inside `imageConfig`)
Currently unset → defaults to `ALLOW_ADULT`. Setting `ALLOW_ALL` ensures consistent rendering of people across all ages, important for fashion/product photography.

### 2. `outputOptions: { mimeType: "image/png" }` (inside `imageConfig`)
Currently unset → API defaults to JPEG. Your upload code saves as PNG anyway, but the source data is JPEG-compressed. Requesting PNG from Gemini gives lossless quality at the source.

### 3. `imageSize` defaults for all functions
- **Freestyle**: Already has `"2K"` for high quality, but no default for standard → add `"1K"` as baseline
- **Workflow / Try-On / Preview**: No `imageSize` at all → add `"2K"` for workflow/tryon (these are final deliverables), `"1K"` for preview

### 4. `temperature: 1.0` (inside `generationConfig`)
Google's recommended default for image generation. Explicitly setting it ensures consistent photorealistic output across API versions.

### 5. `numberOfImages: 1` (inside `imageConfig`)
Explicitly set to avoid any API default changes. The native API supports `1-4` images per call.

## Files to Update

### `generate-freestyle/index.ts` (~line 747-753)
```typescript
const imageConfig: Record<string, unknown> = {
  personGeneration: "ALLOW_ALL",
  outputOptions: { mimeType: "image/png" },
};
if (aspectRatio) imageConfig.aspectRatio = aspectRatio;
imageConfig.imageSize = quality === 'high' ? "2K" : "1K";

const generationConfig: Record<string, unknown> = {
  responseModalities: ["IMAGE", "TEXT"],
  temperature: 1.0,
  imageConfig,
};
```

### `generate-workflow/index.ts` (~line 693-698)
```typescript
const generationConfig: Record<string, unknown> = {
  responseModalities: ["IMAGE", "TEXT"],
  temperature: 1.0,
  imageConfig: {
    ...(aspectRatio ? { aspectRatio } : {}),
    imageSize: "2K",
    personGeneration: "ALLOW_ALL",
    outputOptions: { mimeType: "image/png" },
  },
};
```

### `generate-tryon/index.ts` (~line 475-480)
Same pattern as workflow — `imageSize: "2K"`, `personGeneration: "ALLOW_ALL"`, PNG output.

### `generate-workflow-preview/index.ts`
Lower priority — keep `imageSize: "1K"` since previews don't need full resolution. Still add `personGeneration` and PNG output.

## Risk
Low. These are all documented, additive parameters. If a parameter is unsupported by the model version, the API ignores it gracefully. Seedream fallback remains untouched.

