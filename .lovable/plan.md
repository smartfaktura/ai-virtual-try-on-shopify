

## Add gender-matching prompt instruction for selected models

### Problem
When a male model is selected and the scene reference contains women (e.g., an editorial scene showing female models), the AI sometimes generates women instead of men. The `modelContext` already carries gender info (`"male, athletic build, ..."`) but there's no explicit instruction forcing all generated people to match the selected model's gender.

### Changes

#### 1. `supabase/functions/generate-freestyle/index.ts` — Add gender enforcement layer

In the `polishUserPrompt` function, right after the MODEL IDENTITY layer (~line 332), add a gender enforcement instruction when `modelContext` indicates a gender:

```typescript
// After the MODEL IDENTITY block, add gender enforcement
if (modelContext) {
  const lowerCtx = modelContext.toLowerCase();
  if (lowerCtx.startsWith('male')) {
    layers.push(
      "GENDER RULE: A male model has been selected. ALL people in this image MUST be male. Do NOT generate any female figures, women, or feminine-presenting people — even if the scene reference image contains women. Replace any implied female presence with male figures matching the selected model's characteristics."
    );
  } else if (lowerCtx.startsWith('female')) {
    layers.push(
      "GENDER RULE: A female model has been selected. ALL people in this image MUST be female. Do NOT generate any male figures, men, or masculine-presenting people — even if the scene reference image contains men. Replace any implied male presence with female figures matching the selected model's characteristics."
    );
  }
}
```

Also add the same logic in the **condensed multi-reference path** (~line 183, after the MODEL bullet), so both code paths are covered.

#### 2. No frontend changes needed
The `modelContext` string already starts with the gender (e.g., `"male, athletic build, Asian"`) — set at `Freestyle.tsx:411`. No changes needed on the client side.

