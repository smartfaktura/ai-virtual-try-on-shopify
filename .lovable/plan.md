

# Dynamic Prompt Engineering for Product Image Scenes

## Problem

The current `buildInstruction` function (line 172-186 in `ProductImages.tsx`) is extremely basic — it concatenates `scene.description` (a short UI label) with flat key-value pairs like `Background: soft white`. This produces weak, generic prompts that lack photographic direction, texture detail, and fail to incorporate the rich Refine data users configure.

## Solution

### 1. Add `promptTemplate` to each scene (`sceneData.ts`)

Instead of a static `promptInstruction`, add a `promptTemplate` string with **placeholder tokens** that get resolved at generation time using product analysis + refine settings. Tokens use `{{variable}}` syntax.

Example for `clean-packshot`:
```
Professional ecommerce product photograph of {{productName}} ({{productType}}) on {{background}} seamless background. {{lightingDirective}} Sharp center-frame composition with crisp product edges. Ultra-sharp focus on every surface detail — {{materialTexture}}, label text, finish reflections. True-to-life color accuracy, {{shadowDirective}}. {{consistencyDirective}} 8K photorealistic commercial packshot quality.
```

Example for `in-hand-studio`:
```
Studio product photograph of {{productName}} held in a {{handStyle}} human hand against a {{background}} background. {{personDirective}} Crisp edge-to-edge sharpness on both the product and skin — visible skin pores, natural hand anatomy, {{nailDirective}}. {{lightingDirective}} Product is the clear hero, hand provides natural scale. {{materialTexture}}. Professional commercial photography, hyper-realistic skin and material rendering, 8K detail.
```

Example for `bag_detail_macro`:
```
Extreme close-up macro photograph of {{productName}} construction details. Tack-sharp focus on {{focusArea}} — visible micro-details: thread tension, {{materialTexture}}, edge paint line. Shallow depth of field, {{lightingDirective}} with subtle reflections on surfaces. {{accentDirective}} Ultra-realistic material photography, 8K macro commercial detail.
```

### 2. Create `buildDynamicPrompt` utility (`src/lib/productImagePromptBuilder.ts`)

New file with a single function that resolves tokens from all available data sources:

**Input**: scene, product, productAnalysis, refineSettings (details object), selectedModel

**Token resolution map**:

| Token | Source | Example output |
|---|---|---|
| `{{productName}}` | `product.title` | "Chanel No.5 Eau de Parfum" |
| `{{productType}}` | `product.product_type` or `analysis.category` | "fragrance" |
| `{{background}}` | `details.backgroundTone` or refine aesthetic `backgroundFamily` | "warm beige" |
| `{{lightingDirective}}` | `details.lightingStyle` or refine `lightingFamily` → mapped to full sentence | "Soft diffused studio lighting with even fill and no harsh shadows." |
| `{{shadowDirective}}` | `details.shadowStyle` → mapped | "Product grounded with a barely-visible natural shadow." |
| `{{materialTexture}}` | `analysis.materialFamily` + `analysis.finish` | "visible leather grain, matte finish" |
| `{{surfaceDirective}}` | `details.surfaceType` or refine `surfaceMaterial` | "placed on warm brushed wood surface" |
| `{{personDirective}}` | person styling fields → assembled sentence | "Model: feminine presentation, age 25-35, medium skin tone, soft smile expression." |
| `{{handStyle}}` | `details.handStyle` | "polished beauty" |
| `{{nailDirective}}` | `details.nails` | "polished nails with clean manicure" |
| `{{outfitDirective}}` | `details.outfitStyle` + color direction | "Wearing elegant minimal luxury outfit in neutral tones." |
| `{{focusArea}}` | `details.focusArea` | "leather grain, stitching, metal clasp" |
| `{{accentDirective}}` | refine accent color → sentence | "Subtle warm accent tones complementing the product palette." |
| `{{consistencyDirective}}` | refine consistency level → sentence | "Maintain strong visual consistency with other shots in this series." |
| `{{productSize}}` | `analysis.sizeClass` | "small" |
| `{{colorFamily}}` | `analysis.colorFamily` | "warm brown with gold accents" |
| `{{stylingDirective}}` | refine `stylingDirection` → sentence | "Minimal luxury styling direction with refined simplicity." |
| `{{moodDirective}}` | `details.mood` | "Premium, sophisticated mood." |
| `{{environmentDirective}}` | `details.environmentType` | "calm interior setting" |
| `{{brandingDirective}}` | `details.brandingVisibility` → sentence | "Brand logo and text subtly visible but not dominant." |
| `{{customNote}}` | `details.customNote` | appended raw |
| `{{modelDirective}}` | selected model info | "Use the specific model reference provided in the source image." |
| `{{packagingDirective}}` | packaging fields → sentence | "Product shown with its outer box packaging, partially open." |

**Fallback logic**: If a token has no user value, it resolves to a smart default based on the scene type and product analysis. For example, `{{lightingDirective}}` with no user selection → infer from category: fragrance→"Soft directional side lighting", tech→"Crisp controlled studio lighting".

**Quality anchor**: Every prompt ends with a fixed suffix: `"Professional product photography, ultra-sharp focus, hyper-realistic textures and materials, 8K commercial quality, photorealistic rendering."`

### 3. Add `promptTemplate` to all ~80 scenes

Each scene gets a template tailored to its shot type. Templates are 3-5 sentences with tokens for dynamic data. Grouped by type:

- **Packshot/studio scenes** (6): Focus on background, lighting, shadow, material texture
- **Person/hand scenes** (20+): Include person directive, hand style, nails, outfit, expression, skin
- **Detail/macro scenes** (15+): Focus on focus area, material texture, crop intensity
- **Lifestyle/environment scenes** (15+): Include environment, surface, styling, mood
- **Editorial scenes** (10+): Include mood, styling direction, accent, consistency
- **Packaging scenes** (6+): Include packaging directive, reference strength
- **Flat lay scenes** (5+): Include arrangement, styling density, props

### 4. Update `buildInstruction` in `ProductImages.tsx`

Replace the current flat key-value concatenation with a call to `buildDynamicPrompt`:

```typescript
import { buildDynamicPrompt } from '@/lib/productImagePromptBuilder';

const buildInstruction = useCallback((scene, product) => {
  const analysis = product.analysis_json as ProductAnalysis | null;
  return buildDynamicPrompt(scene, product, analysis, details);
}, [details]);
```

The generation loop already iterates product × scene, so we pass the current product to get product-specific tokens resolved.

### 5. Update `ProductImageScene` type

Add `promptTemplate?: string` to the interface in `types.ts`.

## Files Modified

| File | Change |
|---|---|
| `src/components/app/product-images/types.ts` | Add `promptTemplate?: string` to `ProductImageScene` |
| `src/lib/productImagePromptBuilder.ts` | **New** — `buildDynamicPrompt()` with token resolution, lighting/shadow/person mapping tables, quality suffix |
| `src/components/app/product-images/sceneData.ts` | Add `promptTemplate` to all ~80 scenes with tokens |
| `src/pages/ProductImages.tsx` | Replace `buildInstruction` to use `buildDynamicPrompt`, pass product to it in generation loop |

## Key Design Decisions

- Templates live in `sceneData.ts` alongside scene definitions — easy to edit and preview
- Token resolution is pure functions with no side effects — testable
- Fallback defaults are category-aware (fragrance defaults differ from tech defaults)
- The quality suffix is always appended, ensuring every prompt demands 8K photorealistic output
- Person tokens only resolve when the scene has person-related trigger blocks — no phantom person descriptions in product-only shots

