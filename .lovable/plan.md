

# User-Generated Models (Growth & Pro Only, 20 Credits)

## Overview
Allow paid users (Growth/Pro plans) to generate a custom AI model from a reference photo. The system uses AI image generation to create a polished model reference image, then saves it as a personal model visible only to that user. Cost: 20 credits per generation.

## Architecture Decision
Current `custom_models` table is admin-only (shared across all users). User-generated models need a **new `user_models` table** scoped to individual users via `user_id`, with standard RLS (users see only their own models).

## Database

### New table: `user_models`
```sql
CREATE TABLE public.user_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  gender text NOT NULL DEFAULT 'female',
  body_type text NOT NULL DEFAULT 'average',
  ethnicity text NOT NULL DEFAULT '',
  age_range text NOT NULL DEFAULT 'adult',
  image_url text NOT NULL,          -- final generated image
  source_image_url text NOT NULL,   -- user's original reference
  credits_used integer NOT NULL DEFAULT 20,
  created_at timestamptz DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.user_models ENABLE ROW LEVEL SECURITY;
-- Users CRUD their own models
CREATE POLICY "Users can manage own models" ON public.user_models FOR ALL
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

## New Edge Function: `generate-user-model`
1. Validates JWT, checks plan is `growth` or `pro`
2. Deducts 20 credits via `deduct_credits` RPC
3. Calls `create-model-from-image` logic (AI analysis) to extract metadata (name, gender, etc.)
4. Calls AI image generation (Gemini image model) with a prompt like: *"Professional fashion model portrait based on this reference, clean studio background, high quality"*
5. Uploads generated image to `scratch-uploads` bucket
6. Inserts row into `user_models`
7. Returns the new model data

## Frontend Changes

### New hook: `src/hooks/useUserModels.ts`
- `useUserModels()` — fetch user's own models, convert to `ModelProfile[]`
- `useGenerateUserModel()` — mutation calling the edge function
- `useDeleteUserModel()` — delete own model

### ModelSelectorChip.tsx
- Import `useUserModels` alongside `useCustomModels`
- Merge user models into the `allModels` list (after custom models)
- User models get a subtle "My Model" badge to distinguish them

### New component: `GenerateModelModal.tsx`
- Upload reference image
- Show preview + "Generate Model (20 credits)" button
- Plan gate: show upgrade prompt if user is on Free/Starter
- Loading state while AI generates
- On success: show result with editable metadata fields, then save

### Entry point
- Add a "Create Your Own Model" button/card in the model selector (ModelSelectorChip) — visible only to Growth/Pro users
- Could also be accessible from a Models section in Settings or Freestyle page

## Files changed

| File | Change |
|------|--------|
| Migration | Create `user_models` table + RLS |
| `supabase/functions/generate-user-model/index.ts` | New edge function |
| `src/hooks/useUserModels.ts` | New hook |
| `src/components/app/GenerateModelModal.tsx` | New modal component |
| `src/components/app/freestyle/ModelSelectorChip.tsx` | Merge user models + add "Create" entry point |
| `src/components/app/CreativeDropWizard.tsx` | Merge user models into workflow model picker |

## Credit & Plan Gating
- Credits deducted server-side via existing `deduct_credits` RPC (atomic, handles low-credit email notifications)
- Plan check happens in the edge function: reject if plan is `free` or `starter`
- Frontend shows the button only for Growth/Pro users, with a tooltip/upgrade nudge for lower tiers

