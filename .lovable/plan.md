

# Catalog Rewrite: Fix Crash + UX Overhaul + AI-Generated Previews + Shot Styling

## Problems identified

1. **Runtime crash**: `PoseCategorySection` crashes when `category` has no entry in `categoryInfo` — `info` is undefined, accessing `info.title` throws
2. **Bad UX**: Too many steps, dense grids, no visual hierarchy — feels like a data table not a creative tool
3. **No AI-generated previews**: Pose and background cards use static mock images — user wants AI-generated white-studio reference images via Nano Banana Pro 2
4. **No per-shot styling**: No way to customize a specific product+model combination (e.g. "this dress on this model in this specific style")

## Plan

### 1. Fix the crash (immediate)

**`src/components/app/PoseCategorySection.tsx`** — Add fallback when `categoryInfo[category]` is undefined:
```typescript
const info = categoryInfo[category] ?? { title: category, recommendation: '' };
```

### 2. Simplify the stepper layout

**`src/pages/CatalogGenerate.tsx`** — Complete rewrite with cleaner UX:
- Reduce from 5 steps to **3 steps**: (1) Products + Models, (2) Style (poses, backgrounds, per-shot customization), (3) Review
- Replace the button stepper with a minimal progress bar / breadcrumb
- Step 1: Side-by-side layout — products on left, models on right (compact thumbnails, not full cards)
- Step 2: Visual style builder — horizontal scrolling pose gallery + background gallery with large preview cards
- Step 3: Review with matrix summary (keep existing)

### 3. AI-generated pose & background preview images

**New: `src/hooks/useCatalogPreviews.ts`** — Hook that generates preview reference images on-demand:
- Uses Lovable AI gateway (`google/gemini-3.1-flash-image-preview` = Nano Banana 2) via an edge function
- When user enters Step 2, generates preview thumbnails for each pose category (e.g. "fashion model in studio front pose, white studio background, full body")
- Caches generated previews in Supabase Storage (`catalog-previews` bucket) keyed by pose name hash
- Falls back to existing `previewUrl` from mockData if AI generation fails or while loading

**New: `supabase/functions/generate-catalog-preview/index.ts`** — Edge function that:
- Accepts pose/background description + style hints
- Calls Lovable AI gateway with `modalities: ["image", "text"]`
- Uploads result to `catalog-previews` storage bucket
- Returns public URL
- Rate-limited to prevent abuse (max 20 previews per session)

**DB migration**: Create `catalog-previews` storage bucket with public read access

### 4. Per-shot styling ("Style one specific shot")

**New: `src/components/app/catalog/CatalogShotStyler.tsx`** — Modal/drawer that lets user:
- Pick a specific product+model combination from the matrix
- Override the default pose, background, aspect ratio, or framing for that specific combo
- Add a custom prompt instruction (e.g. "make it look more luxury", "add motion blur")
- These overrides are passed as `shot_overrides` to the generation hook

**`src/hooks/useCatalogGenerate.ts`** — Accept optional `shotOverrides: Map<string, ShotOverride>` where key is `productId_modelId` and value contains custom pose/bg/prompt overrides. When iterating the matrix, check for overrides before using defaults.

### 5. Updated component structure

**`src/components/app/catalog/CatalogStepProductsModels.tsx`** — Merged Step 1:
- Two-column layout: product grid (left) + model grid (right)
- Compact thumbnail cards with checkboxes
- Running counter at bottom

**`src/components/app/catalog/CatalogStepStyle.tsx`** — New Step 2:
- Horizontal scrolling pose cards with AI-generated previews (large, visual)
- Horizontal scrolling background cards with AI-generated previews
- "Customize Shot" button per product×model cell in a mini-matrix preview
- Framing selector (full-body, half-body, close-up)

**Keep existing**: `CatalogStepReview.tsx` (Step 3), `CatalogMatrixSummary.tsx` (sticky bar)

### Files summary

| Action | File |
|--------|------|
| Fix | `src/components/app/PoseCategorySection.tsx` — null-safe `categoryInfo` lookup |
| Rewrite | `src/pages/CatalogGenerate.tsx` — 3-step flow |
| Create | `src/components/app/catalog/CatalogStepProductsModels.tsx` |
| Create | `src/components/app/catalog/CatalogStepStyle.tsx` |
| Create | `src/components/app/catalog/CatalogShotStyler.tsx` |
| Create | `src/hooks/useCatalogPreviews.ts` |
| Create | `supabase/functions/generate-catalog-preview/index.ts` |
| Update | `src/hooks/useCatalogGenerate.ts` — shot overrides support |
| Update | `src/components/app/catalog/CatalogStepReview.tsx` — show overrides |
| Delete | `src/components/app/catalog/CatalogStepPoses.tsx` (merged into Style step) |
| Delete | `src/components/app/catalog/CatalogStepBackgrounds.tsx` (merged into Style step) |
| Migration | Create `catalog-previews` storage bucket |

