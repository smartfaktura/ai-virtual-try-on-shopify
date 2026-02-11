

## Fix: Freestyle Quality with Product + Model + Scene Combined

### Problem
When selecting a product, model, AND scene together, the generated images aren't faithful to the references because:
1. **Duplicate scene instructions** -- the frontend injects "MANDATORY SCENE:..." into the prompt, and the backend's `polishUserPrompt` adds its own "ENVIRONMENT:..." layer. Two competing scene blocks confuse the AI model.
2. **No priority hierarchy** -- with 3 reference images and many instruction layers, the AI doesn't know what matters most.
3. **Generic product phrasing** -- "worn/held by" assumes wearable products; doesn't adapt for items like electronics, bottles, food, etc.
4. **No final task summary** -- after a wall of instructions and 3 images, the AI needs a concise recap.

### Changes

#### 1. Frontend -- `src/pages/Freestyle.tsx`

**Remove the frontend scene mandate** to avoid duplication with the backend polish:

```
// Before:
let finalPrompt = basePrompt;
if (selectedScene) {
  finalPrompt = `${basePrompt}. MANDATORY SCENE: Place the subject in this environment — ...`;
}

// After:
let finalPrompt = basePrompt;
// Scene instructions are handled by polishUserPrompt in the backend
// No need to duplicate them here
```

**Improve auto-prompt product-model phrasing** -- use product type to determine interaction:

```
// Before:
parts.push(`worn/held by a ${modelDesc} model`);

// After: context-aware interaction
const interaction = getProductModelInteraction(selectedProduct.product_type);
parts.push(`${interaction} a ${modelDesc} model`);

function getProductModelInteraction(productType: string): string {
  const type = productType.toLowerCase();
  if (['dress','shirt','jacket','pants','skirt','top','hoodie','sweater','coat','jeans','clothing','apparel'].some(t => type.includes(t)))
    return 'worn by';
  if (['bag','handbag','purse','backpack','tote'].some(t => type.includes(t)))
    return 'carried by';
  if (['shoes','sneakers','boots','heels','sandals','footwear'].some(t => type.includes(t)))
    return 'worn by';
  if (['jewelry','necklace','ring','bracelet','earrings','watch'].some(t => type.includes(t)))
    return 'worn by';
  if (['hat','cap','beanie','headwear'].some(t => type.includes(t)))
    return 'worn by';
  return 'showcased/held by';
}
```

#### 2. Backend -- `supabase/functions/generate-freestyle/index.ts`

**Add a TASK SUMMARY at the end of `buildContentArray`** when multiple references are present:

```typescript
// After all images are added, append a clear task summary
const refCount = [sourceImage, modelImage, sceneImage].filter(Boolean).length;
if (refCount >= 2) {
  const taskParts: string[] = ["TASK SUMMARY — Generate ONE cohesive image that:"];
  if (sourceImage) taskParts.push("1. Features the EXACT product from the product reference (highest priority — shape, color, texture, branding must be identical)");
  if (modelImage) taskParts.push(`${sourceImage ? '2' : '1'}. Uses the EXACT person from the model reference (same face, hair, skin tone)`);
  if (sceneImage) taskParts.push(`${refCount}. Places everything in the EXACT environment from the scene reference`);
  taskParts.push("Merge all references into a single photorealistic image. Product fidelity is the #1 priority.");
  content.push({ type: "text", text: taskParts.join("\n") });
}
```

**Strengthen the priority hierarchy in `polishUserPrompt`** when all three contexts are present:

Add a priority instruction when product + model + scene are all present:

```typescript
// After all layers are built, before negatives
if (context.hasSource && context.hasModel && context.hasScene) {
  layers.push(
    "PRIORITY ORDER: 1) Product must be reproduced with 100% accuracy (shape, color, branding). 2) Model must be the exact same person from the reference. 3) Scene/environment must match the reference. If any conflict arises between these, product accuracy takes precedence."
  );
}
```

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Remove duplicate scene mandate from frontend; improve product-model interaction phrasing |
| `supabase/functions/generate-freestyle/index.ts` | Add task summary in `buildContentArray`; add priority hierarchy in `polishUserPrompt` |

### Why This Fixes the Issue
- Eliminates conflicting duplicate scene instructions
- Gives the AI a clear priority order (product first, then model, then scene)
- Adds a concise task summary after all reference images so the model knows exactly what to produce
- Uses smarter product-type-aware phrasing instead of generic "worn/held by"
