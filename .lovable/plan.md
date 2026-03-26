

# Fix: On-Model Scenes Should Generate People Even Without Explicit Model Selection

## Problem

When a user selects a **product** + an **"On-Model" scene** (like Natural Light Loft) but does NOT select a specific model, the system generates a floating product shot instead of a person wearing the product in that scene.

This happens because:
1. The backend has no idea whether the selected scene is an "on-model" or "product" scene -- that category info stays in the frontend
2. Without a model selected, `hasModel = false`, so no person-placement or outfit-completion directives fire
3. The auto-generated prompt just says "product photography" with no mention of a person

## Solution

### 1. Pass scene category from frontend to backend

**File: `src/pages/Freestyle.tsx`**
- When building the generation payload, include a new field `sceneCategory` from `selectedScene.category` (e.g. `"studio"`, `"lifestyle"`, `"editorial"`, `"streetwear"` for on-model; `"clean-studio"`, `"surface"`, `"flat-lay"` for product)

### 2. Accept and use scene category in the edge function

**File: `supabase/functions/generate-freestyle/index.ts`**
- Add `sceneCategory?: string` to `FreestyleRequest`
- Define which categories are "on-model": `studio`, `lifestyle`, `editorial`, `streetwear`
- When `hasProduct && hasScene && !hasModel` and the scene category is on-model:
  - Upgrade the SCENE directive to include person placement: "Place a model naturally INTO the environment. The model should wear the product as the hero piece with a complete, styled outfit."
  - Add outfit completion directive (same as the existing one for hasModel)
- When auto-building prompt (empty prompt case), detect on-model scene category and include "worn by a model" language

### 3. Auto-prompt improvement for product + on-model scene (no model selected)

**File: `src/pages/Freestyle.tsx`**
- In the auto-prompt builder (~line 546), when `selectedProduct` exists and `selectedScene` has an on-model category but no model is selected, change the prompt from "product photography" to "product photography worn by a professional model"

## What This Does NOT Do
- No database changes
- No UI changes (scene picker stays the same)
- No changes when a model IS explicitly selected (existing logic is correct)

## Files Modified
- `src/pages/Freestyle.tsx` — pass `sceneCategory`, improve auto-prompt
- `supabase/functions/generate-freestyle/index.ts` — accept `sceneCategory`, add person-placement directive for on-model scenes without explicit model

