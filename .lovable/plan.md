

# Catalog: Dedicated Poses & Backgrounds (Separate from Other Workflows)

## Problem
The catalog workflow currently imports `mockTryOnPoses` and `useCustomScenes` — these are shared across Try-On, Freestyle, and other workflows. The user wants the catalog to have its **own dedicated pose and background data**, generated via AI (Lovable gateway with `google/gemini-3.1-flash-image-preview`).

## What changes

### 1. New dedicated catalog data file: `src/data/catalogPoses.ts`
Define catalog-specific pose and background entries with their own IDs, names, categories, and prompt descriptions. These are **not** shared with Try-On or Freestyle:
- **Poses** (~12): Studio Front, Studio Side, Walking, Seated, Over-the-Shoulder, Three-Quarter, Close-Up, etc. — each with a `promptHint` for AI generation
- **Backgrounds** (~12): White Seamless, Gray Gradient, Marble Surface, Botanical Garden, Urban Street, Living Room, etc. — each with a `promptHint`
- All entries use `catalogPose_` and `catalogBg_` prefixes to avoid ID collisions

### 2. Fix edge function: `supabase/functions/generate-catalog-preview/index.ts`
- Switch from direct `GEMINI_API_KEY` to `LOVABLE_API_KEY` + Lovable AI gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`)
- Use model `google/gemini-3.1-flash-image-preview`
- Fix image extraction from response (Lovable gateway may return images differently than direct Gemini API)

### 3. Update `src/components/app/catalog/CatalogStepStyle.tsx`
- Remove imports of `mockTryOnPoses` and `useCustomScenes`
- Import new `catalogPoses` and `catalogBackgrounds` from `src/data/catalogPoses.ts`
- Keep the same UI structure (category-grouped horizontal scroll galleries)
- Wire up `useCatalogPreviews` to auto-generate AI previews for each catalog item on mount

### 4. Update `src/pages/CatalogGenerate.tsx`
- Remove `mockTryOnPoses` import and any references to shared pose data
- Import catalog-specific data for passing to the review step's `allPoses` prop

### 5. Update `src/hooks/useCatalogGenerate.ts`
- Update `allPoses` to use catalog-specific data instead of shared `mockTryOnPoses`

## Files summary

| Action | File |
|--------|------|
| Create | `src/data/catalogPoses.ts` — dedicated pose + background definitions |
| Rewrite | `supabase/functions/generate-catalog-preview/index.ts` — use Lovable gateway |
| Update | `src/components/app/catalog/CatalogStepStyle.tsx` — use catalog data only |
| Update | `src/pages/CatalogGenerate.tsx` — remove shared data imports |
| Update | `src/hooks/useCatalogGenerate.ts` — use catalog-specific poses |

## Technical details
- Lovable AI gateway URL: `https://ai.gateway.lovable.dev/v1/chat/completions`
- Model: `google/gemini-3.1-flash-image-preview`
- Auth: `LOVABLE_API_KEY` (already available in edge function env)
- Previews cached in `catalog-previews` storage bucket (already created)
- No DB migration needed

