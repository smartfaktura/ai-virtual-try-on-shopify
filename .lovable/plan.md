

## Refined Approach: Gate People DNA on `hasModel || hasProduct`

You're right — the pure `hasModel` flag isn't enough. A user selecting a **product** (crop top, dress, sneakers) clearly expects a person wearing it even without explicitly picking a model.

### The correct logic

**Inject fashion/people DNA and anatomical negatives when:**
- `hasModel === true` — user explicitly picked a model
- `hasProduct === true` — user picked a wearable product (implies a person)

**Skip people DNA when:**
- Neither model nor product is selected — user typed a pure scene/object prompt (like "luxury house living area")

### Changes in `supabase/functions/generate-freestyle/index.ts`

**1. Add `buildGenericDNA()` function** (~line 88)
```typescript
function buildGenericDNA(): string {
  return `Ultra high resolution, photorealistic, razor-sharp details, natural lighting, professional photography. Subtle film grain, elegant highlight roll-off.`;
}
```

**2. Update the `else` branch in `polishUserPrompt()`** (lines 222-225)
Currently always injects fashion DNA. Change to:
```typescript
} else {
  layers.push(`Professional photography: ${rawPrompt}`);
  const wantsPeople = context.hasModel || context.hasProduct;
  layers.push(wantsPeople ? buildPhotographyDNA() : buildGenericDNA());
}
```

**3. Update `buildNegativePrompt()`** (lines 91-106)
Add a `hasPeople` parameter. When `false`, omit the 3 anatomical lines (arms/hands/legs) that trick the AI into adding humans:
```typescript
function buildNegativePrompt(cameraStyle?: 'pro' | 'natural', hasPeople = true): string {
  // ... blurRule stays the same ...
  const anatomyRules = hasPeople ? `
- Exactly 2 arms, 2 hands (5 fingers each), 2 legs per person — no extra, missing, or merged limbs
- Natural joint articulation only — no impossible bends, twisted spines, or backward limbs
- No duplicated or phantom body parts` : '';
  // rest stays the same, just conditionally include anatomyRules
}
```

**4. Update the call site** (line 367)
```typescript
const wantsPeople = context.hasModel || context.hasProduct;
let negativeBlock = buildNegativePrompt(cameraStyle, wantsPeople);
```

### Why this works

| User action | hasModel | hasProduct | Result |
|---|---|---|---|
| Types "luxury house interior" | false | false | Generic DNA, no anatomy rules → no people |
| Selects crop top product | false | true | Fashion DNA + anatomy rules → person wearing product |
| Selects model + scene | true | false | Fashion DNA + anatomy rules → model in scene |
| Selects model + product | true | true | Fashion DNA + anatomy rules → model wearing product |

No keyword lists, no AI classification, just the context flags already available. One file, ~20 lines changed.

