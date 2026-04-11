

# Add Default Clothing Rule to Model Generation Prompts

## Problem
Generated models have no clothing directive, so the AI picks arbitrary outfits. The user wants a clean, consistent look: **white cami top** for female models, **white t-shirt** for male models.

## Changes — `supabase/functions/generate-user-model/index.ts`

### 1. `buildPromptFromDescription` (line 31)
Insert a gender-conditional clothing line before the background/lighting block:

```
Wearing a simple white cami top.   // if female
Wearing a simple white t-shirt.    // if male
```

### 2. Reference mode prompt (line 322)
Add the same clothing rule into the inline prompt string, after `${genderWord} model.`:

```
Wearing a ${genderWord === 'male' ? 'simple white t-shirt' : 'simple white cami top'}.
```

### 3. Combined mode (line 330)
`buildPromptFromDescription` already handles it via change #1. No extra work needed.

This ensures all three generation modes (generator, reference, combined) produce models with the correct default garment. Requires redeploying the `generate-user-model` edge function.

