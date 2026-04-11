

# Generate 3 Brand Model Variations for User Selection

## Current Behavior
- **Admin (makePublic=true)**: Generates 3 variations → user picks best → publishes to public library ✅
- **Regular user**: Generates 1 image → immediately saves & deducts 20 credits → no choice ❌

## Goal
Regular brand model users should also get 3 variations, pick the best one, then confirm before saving/deducting credits.

## Changes

### 1. Edge Function — `supabase/functions/generate-user-model/index.ts`

**Add new action: `save-brand-model`** (similar to `publish-public` but saves to `user_models` instead of `custom_models`):
- Accepts `selectedUrl`, `metadata`, `name`
- Deducts 20 credits
- Inserts into `user_models`
- Returns the saved model + new balance

**Modify regular user flow** (lines 318-350):
- Instead of generating 1 image, generate 3 in parallel (same as admin flow)
- Do NOT deduct credits yet
- Do NOT save to `user_models` yet
- Return `{ variations, metadata, name }` — same shape as admin flow

### 2. Frontend — `src/pages/BrandModels.tsx`

**Modify `handleGenerate`** (line 303-309):
- Remove the `makePublic` condition — always show variation picker when `data?.variations` is returned

**Modify variation picker UI** (lines 364-422):
- When NOT in public mode, show "Save as Brand Model" button instead of "Publish as Public Model"
- Add a confirm step before saving

**Add `handleSaveBrandModel`**:
- Calls edge function with `action: 'save-brand-model'`
- Passes `selectedUrl`, `metadata`, `name`
- On success: refresh balance, invalidate queries, reset form

### 3. Loading State
- Update `BrandedLoadingState` — remove `isPublicMode` distinction since both flows now generate 3 variations
- Update estimate to ~1-2 min for all users

## Summary of Flow (After)
1. User fills out generator form → clicks Generate (20 credits shown)
2. Edge function generates 3 variations in parallel, returns all 3 URLs (no credits deducted yet)
3. User sees variation picker, selects favorite
4. User clicks "Save as Brand Model" → edge function deducts credits + saves to `user_models`
5. Model appears in their brand models list

