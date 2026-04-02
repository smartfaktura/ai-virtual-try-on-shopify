

# Fix Catalog Model Reference & Background Issues

## Root Causes Found

### 1. Model profile text is too generic
In `CatalogGenerate.tsx` line 244, the model profile is built as:
```
profile: `${m.ageRange} ${m.gender} model`
```
This produces "adult female model" — losing the model's **name, ethnicity, and body type**. Seedream gets the model's reference image but the prompt gives no visual description to anchor it.

### 2. Prompt doesn't instruct Seedream to match the model reference image
The `[MODEL]` placeholder is replaced with just the generic text. There's no explicit directive telling Seedream "reproduce the EXACT person shown in the model reference image". Since Seedream receives multiple reference images (product + model), it doesn't know the second image is a model to replicate.

### 3. Background enforcement is weak
The background prompt block describes the color/setup, but nothing tells Seedream to IGNORE the background in the model reference photo. The model's original photo background bleeds through (warm sunlight).

## Changes

### File 1: `src/pages/CatalogGenerate.tsx` (~line 244)
Build a richer `profile` string that includes the model's visual identity:
```typescript
profile: `${m.name}, ${m.ethnicity} ${m.ageRange} ${m.gender} model, ${m.bodyType} build`
```
This produces e.g. "Freya, Scandinavian adult female model, slim build" — giving Seedream descriptive text to anchor against the reference image.

### File 2: `src/lib/catalogEngine.ts` — `assemblePrompt` function (~line 716)
Add two critical directives to every assembled prompt:

1. **Model identity anchor**: After the main prompt, append an explicit instruction:
   `"CRITICAL: The model MUST be the EXACT person shown in [MODEL IMAGE] — replicate their face, skin tone, hair color, hair style, and body proportions precisely. Do NOT substitute a different person."`

2. **Background isolation**: Append:
   `"BACKGROUND RULE: Use ONLY the specified studio background. IGNORE any background, environment, or lighting from the model reference photo."`

These will be appended as suffix blocks to the assembled prompt for any shot that has a model (`needsModel: true`).

### File 3: `src/lib/catalogEngine.ts` — `CONSISTENCY_BLOCK` constant (~line 703)
Strengthen the consistency block to include model identity preservation explicitly:
```
"same model identity matching [MODEL IMAGE] exactly, same face same hair same skin tone, ..."
```

## Summary
Three targeted changes: richer model description text, explicit model-matching directives, and background isolation rules. No structural changes to the pipeline — just stronger prompt engineering to make Seedream honor the model reference and background settings.

