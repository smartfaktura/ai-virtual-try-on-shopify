

# Seedream-First Catalog Builder — Anchor-Based Pipeline

## Overview
Rebuild the catalog generation engine around a **session → anchor → derivative** pipeline instead of independent per-shot generation. The user flow stays the same (Product → Style → Model → Background → Shots → Generate), but the backend uses staged generation with reference images and edit-vs-regenerate routing.

## Architecture

```text
User clicks Generate
        │
        ▼
┌─ Stage 1: Session Lock ─────────────────────┐
│  Lock: fashion style, model, background,     │
│  lighting, visual tone                       │
└──────────────┬───────────────────────────────┘
               │
     ┌─── Per Product Loop ───┐
     │                        │
     ▼                        │
┌─ Stage 2: Look Resolve ─┐  │
│  Detect category → slot  │  │
│  Resolve support wardrobe│  │
│  Filter compatible shots │  │
└──────────┬───────────────┘  │
           ▼                  │
┌─ Stage 3: Anchor Gen ───┐  │
│  Generate 1 hero image   │  │
│  Wait for completion     │  │
│  Store as anchor ref     │  │
└──────────┬───────────────┘  │
           ▼                  │
┌─ Stage 4: Derivatives ──┐  │
│  For each remaining shot:│  │
│  → classify render path  │  │
│  → attach references     │  │
│  → enqueue job           │  │
└──────────────────────────┘  │
     │                        │
     └────────────────────────┘
```

## New Files

### 1. `src/types/catalog.ts`
- `ProductCategory` — 16 categories (top, trousers, shoes, bag, jewelry, etc.)
- `HeroSlot` — 9 slots (upper_body, lower_body, full_body, footwear, bag, headwear, eyewear, jewelry, accessory)
- `FashionStyleId` — 5 presets + kids_clean
- `CatalogShotId` — ~12 base shot types per category family
- `RenderPath` — `'anchor_generate' | 'anchor_edit' | 'reference_generate' | 'product_only_generate'`
- `CatalogSessionLock` — frozen style/model/background/lighting for the session
- `ProductLookLock` — resolved wardrobe + anchor image URL per product
- `ShotDefinition` — shot metadata including category compatibility, render path, prompt template, whether it needs a model

### 2. `src/lib/catalogEngine.ts`
Core logic module (no UI):

**Category detection** — `detectProductCategory(title, productType, description): ProductCategory` using keyword matching on product metadata.

**Hero slot mapping** — `getHeroSlot(category): HeroSlot`

**Support wardrobe resolver** — `resolveSupportWardrobe(heroSlot, fashionStyle, modelType): Record<HeroSlot, string | null>` — returns text descriptions for each support slot (e.g. "neutral straight trousers"), with the hero slot set to `null`.

**Shot definitions library** — All 12+ base shots with:
- `id`, `label`, `group` (on-model / product-only)
- `compatibleCategories` set
- `defaultRenderPath` (edit vs reference-generate)
- `promptTemplate` with `[HERO_PRODUCT]`, `[MODEL]`, `[SUPPORT_WARDROBE]`, `[BACKGROUND]`, `[LIGHTING]`, `[CONSISTENCY]` placeholders

**Category-aware shot overrides** — Per-category prompt variants (shoes → lower-body framing, bags → carry focus, jewelry → macro, etc.)

**Anchor shot resolver** — `getAnchorShotId(category, hasModel): CatalogShotId` — picks the best first shot per category.

**Render path classifier** — `classifyRenderPath(anchorShotId, targetShotId, category): RenderPath` — decides edit vs reference-generate based on how different the target is from the anchor.

**Prompt assembler** — `assemblePrompt(config, shotDef, overrides): string` — builds structured Seedream prompt from blocks: Subject → Action → Environment → Aesthetics + consistency lock. Edit prompts use Action → Object → Characteristic + "keep unchanged" constraints.

**Reference priority builder** — `buildReferences(productImageB64, anchorImageUrl, modelRef?, poseRef?): ImageRef[]` — max 4 references, ordered by priority.

**Fashion Style definitions** — Each style contains: `stylingTone`, `lightingId`, `poseEnergy`, `supportWardrobeKits` (keyed by model audience type), `accessoryIntensity`.

**Background definitions** — 5 studio presets with prompt block + lighting compatibility + shadow style.

### 3. `src/components/app/catalog/CatalogStepFashionStyle.tsx`
5-6 visual cards (Minimal Studio, Premium Neutral, Editorial Clean, Streetwear Clean, Luxury Soft). Single select, required. Each card shows styling tone preview.

### 4. `src/components/app/catalog/CatalogStepShots.tsx`
Category-aware shot selector. Two groups: "On-Model" and "Product-Only". Cards with toggles. Preselects recommended shots. Greys out incompatible ones with tooltip. Uses `catalogEngine.getCompatibleShots(category)`.

## Modified Files

### 5. `src/pages/CatalogGenerate.tsx` — Full rewrite
**New 5-step flow:**
1. Products (single or multi-select, auto-classify on selection)
2. Fashion Style (new step, required)
3. Model (single select + "No Model" card)
4. Background (single select from 5 studio presets)
5. Shots + Review combined (shot selector + credit summary + generate button)

Steps 2-3-4 become simpler single-select UIs. Step breadcrumb updates to 5 steps.

### 6. `src/hooks/useCatalogGenerate.ts` — Major rewrite
**New staged pipeline:**

```typescript
async function startGeneration(config: CatalogSessionConfig) {
  // Stage 1: Build session lock from selections
  const sessionLock = buildSessionLock(config);

  for (const product of config.products) {
    // Stage 2: Resolve look for this product
    const category = detectProductCategory(product);
    const lookLock = resolveLookLock(category, sessionLock);

    // Stage 3: Generate anchor image
    const anchorShotId = getAnchorShotId(category, !!config.model);
    const anchorJob = await enqueueAnchorJob(product, lookLock, sessionLock);
    // Poll until anchor completes
    const anchorImageUrl = await waitForAnchorCompletion(anchorJob.jobId);

    // Stage 4: Generate remaining shots
    const remainingShots = config.selectedShots.filter(s => s !== anchorShotId);
    for (const shotId of remainingShots) {
      const renderPath = classifyRenderPath(anchorShotId, shotId, category);
      const refs = buildReferences(product.imageB64, anchorImageUrl, ...);
      const prompt = assemblePrompt(lookLock, shotDef, renderPath);
      await enqueueDerivativeJob(product, shotId, renderPath, refs, prompt);
    }
  }
}
```

Key changes:
- Sequential anchor-first generation per product (anchor must complete before derivatives start)
- Each enqueued job carries `render_path` in payload so the edge function knows whether to use edit or generate mode
- References attached as base64 in payload (product image, anchor image, model ref, up to 4 total)
- Consistency block appended to every prompt
- Batch state tracks anchor vs derivative jobs separately for progress UI

### 7. `src/components/app/catalog/CatalogStepProducts.tsx`
Add auto-classification display after selection (shows detected category with override option).

### 8. `src/components/app/catalog/CatalogStepModels.tsx`
Change to single-select + "No Model" card at top.

### 9. `src/components/app/catalog/CatalogStepBackgrounds.tsx`
Change to single-select from curated studio list.

### 10. `src/components/app/CatalogMatrixSummary.tsx`
Update summary: instead of Products × Models × Poses × BGs, show Products × Shots = N images. Include credit estimate.

### 11. `src/components/app/catalog/CatalogStepReview.tsx`
Merge into shots step or simplify to a confirmation section. Update progress UI to show anchor phase vs derivatives phase.

## Files to Delete
- `CatalogStepPoses.tsx` (replaced by Shots)
- `CatalogStepExpression.tsx` (mood folded into Fashion Style)
- `CatalogStepStyleShots.tsx` (replaced by automatic support wardrobe)
- `CatalogStepStyle.tsx` (replaced by Fashion Style step)
- `CatalogStepProductsModels.tsx` (unused)

## Edge Function Awareness
The `render_path` field in the job payload tells `process-queue` / `generate-tryon` how to handle the job:
- `anchor_generate` / `reference_generate` → standard generation with image references
- `anchor_edit` → Seedream edit mode (preserve composition, change specific elements)
- `product_only_generate` → packshot/flat lay generation without model

No edge function changes in this phase — the payload carries the assembled prompt and references; the existing generation pipeline processes them. The `render_path` and reference priority logic is a signal for future edge function optimization.

## No Database Changes
All logic is client-side. Uses existing `enqueue-generation` flow.

## Implementation Order
1. `src/types/catalog.ts` + `src/lib/catalogEngine.ts` (types and engine)
2. `CatalogStepFashionStyle.tsx` + `CatalogStepShots.tsx` (new UI steps)
3. Modify existing steps (Products, Models, Backgrounds → single-select)
4. Rewrite `CatalogGenerate.tsx` (new 5-step flow)
5. Rewrite `useCatalogGenerate.ts` (staged anchor pipeline)
6. Update `CatalogMatrixSummary.tsx` + `CatalogStepReview.tsx`
7. Delete old unused components

