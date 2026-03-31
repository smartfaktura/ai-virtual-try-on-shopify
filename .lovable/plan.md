

# Catalog Shot Set — Seedream 4.5 Only, Separate System

A new standalone workflow for bulk e-commerce catalog photography. Completely separate from existing `generate-workflow` — its own edge function, its own page, its own route. Seedream 4.5 only, 4 credits per image.

## Architecture

```text
Products (20+) × Models (1-5) × Poses (1-6) × Backgrounds (1-6) = N images
Each combination = 1 independent job → enqueue-generation → process-queue → generate-catalog
```

No multi-pass pipeline. Each image is a fully self-contained Seedream prompt with reference images. This matches the Seedream doc's recommended approach: structured prompts (Subject + Action + Environment + Aesthetics) + reference images for identity/product fidelity.

## Phased Implementation

### Phase 1: Database + Edge Function
**Goal**: Backend that can generate a single catalog image from a structured spec.

**Migration**: Insert `catalog-shot-set` workflow row into `workflows` table with:
- `slug: 'catalog-shot-set'`, `name: 'Catalog Shot Set'`
- `uses_tryon: true`, `required_inputs: ['product', 'model']`
- `generation_config` with catalog-specific prompt template and `variation_strategy.type: 'catalog'`

**New file**: `supabase/functions/generate-catalog/index.ts`
- Seedream-only (no Gemini, no fallback chain)
- Accepts structured payload: `{ product, model, pose, background, aspectRatio }`
- Builds Seedream-optimized prompt following the formula from the doc:
  - Subject: model description + product worn/held
  - Action: pose instruction
  - Environment: background description
  - Aesthetics: "professional e-commerce catalog photography, studio lighting, sharp focus"
- Reference images: `[product_image, model_image]` (max 4 per Seedream best practice)
- Uses `generateImageSeedream()` function (same ARK API pattern as existing code)
- Calls `completeQueueJob()` for queue integration
- Uploads to `workflow-previews` bucket with `detectImageFormat`

**Test checkpoint**: Manually invoke the edge function with a test payload and verify it produces an image.

### Phase 2: Catalog Page — Product + Model Selection
**Goal**: New page where users multi-select products and models.

**New file**: `src/pages/CatalogGenerate.tsx`
- Route: `/app/catalog` (add to App.tsx)
- Step 1: Multi-select products from `user_products` (reuse `ProductMultiSelect` component)
- Step 2: Multi-select models (reuse `ModelSelectorCard` + `ModelFilterBar`)
- Show running count: "X products × Y models selected"

**New file**: `src/components/app/CatalogMatrixSummary.tsx`
- Displays the matrix summary and credit estimate

**Test checkpoint**: Navigate to `/app/catalog`, verify product and model multi-select works.

### Phase 3: Pose + Background Selection
**Goal**: Add pose presets and background selection to the catalog page.

**Add to `CatalogGenerate.tsx`**:
- Step 3: Pose/angle preset grid with catalog-specific options:
  - Standing Front, Standing 3/4, Walking, Seated, Close-up Detail, Full Body Movement
  - Each pose has a `name` and `instruction` string for the prompt
- Step 4: Background multi-select with presets:
  - Studio White, Studio Gray, Lifestyle Indoor, Outdoor Urban, Nature, Minimalist
  - Each has a `label` and `instruction` for prompt construction
- Live matrix counter: "20 products × 2 models × 3 poses × 2 backgrounds = 240 images (960 credits)"

**Test checkpoint**: Verify the full matrix UI, ensure credit calculations update live.

### Phase 4: Batch Enqueue + Results
**Goal**: Wire up the "Generate" button to enqueue all matrix combinations and show results.

**Add to `CatalogGenerate.tsx`**:
- Iterate `Product × Model × Pose × Background`, enqueue each as a 1-image job via `enqueueWithRetry`
- Use `skipWake: true` for all but the last, then `sendWake(token)` 
- 300ms pacing between enqueues
- Periodic wake every 30s for batches > 20 jobs
- Progress UI: "Generating 42/240 images..." with per-product breakdown
- Results view: grid of all generated images grouped by product
- Batch download as ZIP (reuse `downloadDropAsZip`)

**Modifications to existing files**:
- `src/App.tsx`: Add `/app/catalog` route
- `src/components/app/AppShell.tsx`: Add sidebar link for "Catalog Shot Set"
- `src/hooks/useGenerationQueue.ts`: Add `'catalog'` to supported job types

**Test checkpoint**: Run a small batch (2 products × 1 model × 1 pose × 1 background = 2 images), verify images appear in results.

### Phase 5: Workflow Card + Animation
**Goal**: Make it discoverable from the Workflows page.

- Add entry to `workflowAnimationData.tsx` with carousel mode
- Add card to Workflows page listing
- Add "Catalog Shot Set" to `StartWorkflowModal` options

**Test checkpoint**: Navigate to Workflows page, verify the card appears and links to `/app/catalog`.

## Technical Details

### Prompt Template (Seedream-optimized per doc)
```
A professional e-commerce catalog photograph of a {model.gender} model, 
{model.ethnicity}, {model.ageRange}, {model.bodyType} build.

The model is wearing/holding the EXACT {product.productType} shown in 
[PRODUCT IMAGE] — preserve all colors, textures, patterns, labels, 
and branding with 100% fidelity.

POSE: {pose.instruction}

ENVIRONMENT: {background.instruction}

STYLE: Clean e-commerce catalog photography. Even, professional 
lighting. Sharp focus on the product. Ultra high resolution.

Do not change the product's appearance from [PRODUCT IMAGE].
```

### Payload Schema (per job)
```json
{
  "jobType": "catalog",
  "payload": {
    "workflow_id": "uuid",
    "product": { "title": "...", "imageUrl": "base64", "productType": "..." },
    "model": { "name": "...", "imageUrl": "base64", "gender": "...", ... },
    "pose": { "name": "Standing 3/4", "instruction": "..." },
    "background": { "label": "Studio White", "instruction": "..." },
    "aspectRatio": "4:5",
    "batch_id": "uuid"
  }
}
```

### Credits
- 4 credits per image (standard), always
- Pre-flight check: `totalImages × 4 ≤ balance`
- Refund on failure via existing `cleanup_stale_jobs`

### Files Created (new)
| File | Purpose |
|------|---------|
| `supabase/functions/generate-catalog/index.ts` | Seedream-only catalog generation |
| `src/pages/CatalogGenerate.tsx` | Full catalog workflow page |
| `src/components/app/CatalogMatrixSummary.tsx` | Matrix counter + credit estimate |

### Files Modified (minimal)
| File | Change |
|------|--------|
| `src/App.tsx` | Add `/app/catalog` route |
| `src/components/app/AppShell.tsx` | Add sidebar nav item |
| Migration | Insert workflow row |

