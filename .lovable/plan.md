## Problem

When users upload a packaging reference image (e.g. a black box), the AI completely ignores it and generates a random beige box. Two bugs cause this:

### Bug 1: Packaging reference never reaches the AI
The upload stores the image in `sceneExtraRefs['trigger:packagingDetails']`. During generation, the trigger_block loop checks `REFERENCE_TRIGGERS['packagingDetails']` — but `packagingDetails` is NOT in `REFERENCE_TRIGGERS` (it's a detail block, not a reference trigger). So the uploaded image is silently dropped.

Meanwhile, `details.packagingReferenceUrl` (the old persistent slot) is only set by auto-fill from `p.packaging_image_url` or the old dedicated upload handler — NOT by the trigger card upload. So that path is also empty.

### Bug 2: Weak prompt labeling
Even when the reference does get through, the label `[PACKAGING REFERENCE] Packaging fidelity reference:` is too vague. The AI treats it as a loose suggestion rather than a strict constraint.

## Fix

### 1. Add `packagingDetails` to `REFERENCE_TRIGGERS` in `detailBlockConfig.ts`

This makes the trigger_block loop correctly pick up the uploaded packaging image and inject it as a reference:

```typescript
packagingDetails: {
  key: 'packagingDetails',
  label: 'Upload packaging photo',
  description: 'Upload a photo of your actual packaging — box, bag, tissue, ribbon — so the AI reproduces it exactly.',
  promptLabel: 'Packaging reference — the packaging in this image is the REAL packaging. Reproduce its EXACT color, material, texture, shape, branding, and construction. Do NOT invent or substitute any packaging element:',
},
```

### 2. Update the IMAGE_LABEL_MAP in `generate-workflow/index.ts`

Strengthen the packaging reference directive so the AI treats it as mandatory:

```typescript
packaging_reference: '[PACKAGING REFERENCE] This is the REAL product packaging — reproduce its EXACT color, material, texture, shape, branding, and construction. Do NOT invent or change any packaging detail:',
```

### 3. Remove the redundant `packaging_reference_url` passthrough in `ProductImages.tsx`

Since packaging references now flow through the standard trigger_block pipeline via `extra_references`, the old `details.packagingReferenceUrl` path (line 951) is no longer needed. However, we keep it for backward compatibility — if both paths fire, the reference just gets injected twice (harmless, reinforces fidelity). No change needed here.

These changes ensure the uploaded packaging photo actually reaches the AI with a strong directive to match it exactly.
