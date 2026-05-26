## Copy update: Brand Models entry point + modal

Rewrite the "Train your own brand model" CTA and its info modal so the wording matches the actual product: users can either build a model via the guided wizard OR upload their own reference images.

### 1. `ProductImagesStep3Refine.tsx` (line 188-189)

CTA card under YOUR BRAND MODELS:

- Title: `Train your own brand model` → **`Create your own brand model`**
- Subtitle: `From your own references — reuse on every shoot` → **`Generate via wizard or from your reference image`**

### 2. `BrandModelsInfoModal.tsx` (pop-up shown after tapping the CTA)

- Subtitle (line 75): `Trained from your own references. Reused across every visual you create.` → **`Build one with the guided wizard or from your own reference image — reuse across every visual you create.`**
- Feature list item (line 18): `Train from your own references — even your real brand models` → **`Create via guided wizard or upload your own reference images`**

No other strings, logic, layout, or styling change.