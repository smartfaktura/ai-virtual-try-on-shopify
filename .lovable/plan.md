

# Fix: Pro Quality Must Use Pro Model + Seedream Must Complete Outfits

## Two Problems Found

### Problem 1 — "Pro" quality pill doesn't select Pro model

Line 1167-1169 in `generate-freestyle/index.ts`:
```typescript
const aiModel = (forceProModel || isPerspective || hasModelImage)
  ? "google/gemini-3-pro-image-preview"
  : "google/gemini-3.1-flash-image-preview";
```

The UI's "Pro" quality pill sets `quality: "high"` in the payload, but the model selection ignores it entirely. Only `forceProModel` (perspectives only), `isPerspective`, or `hasModelImage` trigger Pro. So selecting "Pro" quality without a model reference silently runs Flash — explaining the FLASH badge on your generation.

**Fix**: Add `quality === "high"` to the Pro condition:
```typescript
const aiModel = (forceProModel || isPerspective || hasModelImage || body.quality === "high")
  ? "google/gemini-3-pro-image-preview"
  : "google/gemini-3.1-flash-image-preview";
```

### Problem 2 — Seedream shows only the product garment, no other clothing

When the product is a jacket and a model is selected, Seedream receives only:
- The product image with "replicate this item EXACTLY"
- The model image with "preserve exact face, hair, body"
- No instruction to **dress the model in a complete outfit**

Nano Banana handles this better because the richer system prompt context guides it to create a full look. Seedream's stripped prompt (`cleanPromptForSeedream`) lacks any clothing-completion directive.

**Fix**: Add a wardrobe-completion instruction to the Seedream prompt when:
- A product image is provided AND
- A model reference is provided AND
- The product is an upper-body or single garment

In `buildSeedreamRoleDirective()`, after the product role line, add:
```
OUTFIT COMPLETION: The product shown is a single garment. 
Dress the model in a complete, natural outfit — add 
complementary bottoms, shoes, and accessories that 
match the style. The model must NEVER appear without 
pants/skirt/shorts. The provided product is the hero 
piece; other clothing should complement it naturally.
```

Also inject this same directive into the polished prompt for Nano Banana to reinforce it.

## Changes

### File: `supabase/functions/generate-freestyle/index.ts`

1. **Model selection** (line 1167): Add `body.quality === "high"` to the Pro model condition
2. **`buildSeedreamRoleDirective()`** (line 499): When both model and product roles exist, append outfit-completion instruction
3. **`polishUserPrompt()`** (around line 193): When `hasProduct && hasModel`, add a brief outfit-completion note to the REFERENCES section

## What This Does NOT Do
- No UI changes
- No database changes  
- No changes to fallback logic

## Files Modified
- `supabase/functions/generate-freestyle/index.ts`

