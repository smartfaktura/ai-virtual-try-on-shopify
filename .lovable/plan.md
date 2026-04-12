

# Use `{{productName}}` and Scene Reference for Dynamic Prompts

## What you already have

Your prompt builder supports these product-related tokens in any `prompt_template`:

| Token | Resolves to | Example |
|---|---|---|
| `{{productName}}` | Product title | "Nike Air Max 90" |
| `{{productType}}` | Category or product type | "sneakers" |
| `{{materialTexture}}` | Material + finish description | "premium leather with matte finish" |
| `{{colorFamily}}` | Dominant color family | "white / neutral tones" |
| `{{productSize}}` | Size class | "medium" |

Plus all the styling tokens: `{{background}}`, `{{lightingDirective}}`, `{{outfitDirective}}`, `{{personDirective}}`, `{{aestheticColor}}`, etc.

## How scene reference mode should work

When `use_scene_reference` is ON, the AI model receives **three images**: the product photo, the scene reference photo, and optionally a model photo. The scene reference image does the heavy lifting for composition/lighting/environment.

So the `prompt_template` for reference-mode scenes can be **much simpler** — it just needs to say *what to swap*:

```
Recreate this exact scene composition. Replace the product with {{productName}} ({{productType}}, {{materialTexture}}, {{colorFamily}}). {{outfitDirective}} {{personDirective}}
```

vs. a non-reference scene that needs to describe everything from scratch:

```
Professional editorial shot of {{productName}} on {{background}}, {{lightingDirective}}. {{surfaceDirective}}. {{personDirective}} {{outfitDirective}} {{compositionDirective}}
```

## Plan

### 1. DB migration
Add `use_scene_reference boolean NOT NULL DEFAULT false` to `product_image_scenes`.

### 2. Data layer
- `src/hooks/useProductImageScenes.ts` — map `use_scene_reference` → `useSceneReference`
- `src/components/app/product-images/types.ts` — add `useSceneReference?: boolean` to `ProductImageScene`

### 3. Admin UI toggle
In `src/pages/AdminProductImageScenes.tsx`, add a checkbox: **"Use preview as generation reference"** with a note that the scene's preview image will be sent as a composition guide. Works for all categories.

### 4. Pass reference in generation payload
In `src/pages/ProductImages.tsx`, update the `variationEntry`:
```typescript
const variationEntry = {
  label: ...,
  instruction: variationInstruction,
  aspect_ratio: ratioForJob,
  ...(scene.useSceneReference && scene.previewUrl ? {
    use_scene_reference: true,
    preview_url: scene.previewUrl,
  } : {}),
};
```

### 5. Prompt builder: auto-append scene reference directive
In `src/lib/productImagePromptBuilder.ts`, at the end of `buildDynamicPrompt`, when `scene.useSceneReference` is true:

```typescript
if (scene.useSceneReference && scene.previewUrl) {
  prompt += ` SCENE REFERENCE — Replicate the exact composition, camera angle, lighting setup, and environment from the provided scene reference image. Replace only the product with {{productName}} ({{productType}}). Maintain identical framing, perspective, and overall styling.`;
}
```

This is resolved through the same token system, so `{{productName}}` becomes e.g. "Nike Air Max 90".

### What tokens to use in reference-mode templates

For admins writing `prompt_template` on scenes with `use_scene_reference` ON, keep prompts lean — the image reference handles the environment. Focus on **what changes**:

```
Recreate the scene. Place {{productName}} — a {{productType}} in {{colorFamily}} with {{materialTexture}} finish. {{outfitDirective}} {{personDirective}}
```

The backend already handles image labeling:
- `[PRODUCT IMAGE]` — the product photo
- `[SCENE REFERENCE]` — the composition guide
- `[MODEL IMAGE]` — identity reference (if applicable)

No backend changes needed — the edge function already supports `use_scene_reference` + `preview_url`.

### Files changed
1. **DB migration** — add `use_scene_reference` column
2. `src/components/app/product-images/types.ts` — add `useSceneReference`
3. `src/hooks/useProductImageScenes.ts` — map new column
4. `src/pages/AdminProductImageScenes.tsx` — add toggle
5. `src/pages/ProductImages.tsx` — pass fields in variation entry
6. `src/lib/productImagePromptBuilder.ts` — append reference directive with product tokens

