

# Fix Catalog: Broken Previews, Bad Layout, Confusing UX

## Root Causes

1. **All 23 AI preview requests fire simultaneously on mount** → all hit 429 rate limit → all pose/background cards show broken images (empty `previewUrl: ''` + failed AI generation)
2. **PoseSelectorCard** renders broken `<img>` when `previewUrl` is empty string — shows alt text over gray gradient (the broken cards in screenshot)
3. **ProductMultiSelect** uses `object-cover` on square aspect ratio — crops product images badly
4. **CatalogStepReview** still imports `mockTryOnPoses` from shared data
5. **No guidance** on what the workflow does or how to use it

## Fix Plan

### 1. Replace AI auto-generation with static gradient placeholders + manual "Generate" button
**`src/components/app/catalog/CatalogStepStyle.tsx`**
- Remove the `useEffect` that fires all 23 preview requests on mount
- Remove `useCatalogPreviews` import entirely for now
- Instead, render pose/background cards with **colored gradient placeholders** (no broken images) — each category gets a distinct gradient color
- Add a single "Generate AI Previews" button that triggers sequential generation (one at a time with 2s delay) — optional, not auto

### 2. Create a catalog-specific card component (not PoseSelectorCard)
**New: `src/components/app/catalog/CatalogPoseCard.tsx`**
- Simple card with: gradient background matching category color, pose name, short description, selection state
- When `previewUrl` exists and is non-empty, show the image; otherwise show the styled gradient placeholder with an icon
- Much simpler than the shared PoseSelectorCard which assumes valid images
- Compact size suitable for horizontal scroll galleries

### 3. Fix product image display
**`src/components/app/catalog/CatalogStepProductsModels.tsx`**
- Override the product grid to use `object-contain` with a light background instead of `object-cover` that crops products
- Since we're using `ProductMultiSelect` (shared component), wrap it and pass a custom className or build a simpler inline product grid for catalog that uses `object-contain`

### 4. Fix CatalogStepReview import
**`src/components/app/catalog/CatalogStepReview.tsx`**
- Remove `import { mockTryOnPoses } from '@/data/mockData'` (line 2) — it's unused

### 5. Add sequential preview generation with backoff
**`src/hooks/useCatalogPreviews.ts`**
- Add a queue-based approach: generate previews one at a time with 3s delay between requests
- Add retry with exponential backoff on 429
- Add a `generateAll` method that queues all items sequentially
- Track overall progress (e.g. "Generating preview 3 of 23...")

### 6. Improve UX with intro text and clearer step labels
**`src/pages/CatalogGenerate.tsx`**
- Add a brief intro section explaining the workflow: "Select products, choose models, pick poses & backgrounds, then generate your entire catalog in one batch"

## Files summary

| Action | File |
|--------|------|
| Create | `src/components/app/catalog/CatalogPoseCard.tsx` — gradient placeholder card |
| Update | `src/components/app/catalog/CatalogStepStyle.tsx` — remove auto-generation, use CatalogPoseCard, add manual generate button |
| Update | `src/components/app/catalog/CatalogStepProductsModels.tsx` — fix product image cropping |
| Update | `src/components/app/catalog/CatalogStepReview.tsx` — remove mockTryOnPoses import |
| Update | `src/hooks/useCatalogPreviews.ts` — sequential queue with backoff |
| Update | `src/pages/CatalogGenerate.tsx` — add intro guidance |

