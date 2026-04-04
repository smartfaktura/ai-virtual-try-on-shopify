

# Product Images Generation Flow — Implementation Plan

## Overview

Build a new multi-step generation flow at `/app/generate/product-images` that serves as a broader, smarter product visual generation system. It reuses the existing workflow/queue mechanism from `product-listing-set` but delivers a cleaner, more visual UX with scene-type awareness and adaptive detail blocks.

Given the massive scope, this plan is split into **phases**. Phase 1 delivers a fully working flow; Phase 2 adds admin tooling and category intelligence.

---

## Phase 1 — Core Flow (implement first)

### Files to create

1. **`src/pages/ProductImages.tsx`** — Main page component with stepper state machine
2. **`src/components/app/product-images/ProductImagesStep1Products.tsx`** — Product selection step
3. **`src/components/app/product-images/ProductImagesStep2Scenes.tsx`** — Scene selection (global + category collections)
4. **`src/components/app/product-images/ProductImagesStep3Details.tsx`** — Adaptive detail blocks
5. **`src/components/app/product-images/ProductImagesStep4Review.tsx`** — Credit summary + generation plan
6. **`src/components/app/product-images/ProductImagesStep5Generating.tsx`** — Progress tracking
7. **`src/components/app/product-images/ProductImagesStep6Results.tsx`** — Results display
8. **`src/components/app/product-images/sceneData.ts`** — Scene definitions (global + category collections)
9. **`src/components/app/product-images/detailBlockConfig.ts`** — Which scenes trigger which detail blocks
10. **`src/components/app/product-images/types.ts`** — Shared types for the flow

### Files to modify

1. **`src/App.tsx`** — Add route `/app/generate/product-images` pointing to `ProductImages`
2. **`supabase/functions/generate-workflow/index.ts`** — May need minor extension to handle `product-images` scene payloads (reuses existing workflow job type)

### Technical approach

#### Routing & page shell

- Register lazy route: `const ProductImages = lazy(() => import('@/pages/ProductImages'));`
- Route: `<Route path="/generate/product-images" element={<ProductImages />} />`
- Page uses the same `AppShell` wrapper as all `/app/*` routes

#### Step state machine

```text
Step 1: products → Step 2: scenes → Step 3: details → Step 4: review → Step 5: generating → Step 6: results
```

State managed via `useState<Step>` with a horizontal stepper bar at top (similar to CatalogStepper pattern).

#### Step 1 — Select Products

- Reuse `useQuery(['user-products'])` pattern from Generate.tsx (lines 312-323)
- Multi-select grid with large cards, upload button for new products
- Uses existing `AddProductModal` for new uploads
- Stores `selectedProductIds: Set<string>` and resolved `selectedProducts: UserProduct[]`

#### Step 2 — Select Scenes

**Scene data structure** (in `sceneData.ts`):

```typescript
interface ProductImageScene {
  id: string;
  title: string;
  description: string;
  previewUrl?: string;
  chips?: string[];           // mini descriptor chips
  triggerBlocks: string[];    // which detail blocks this scene activates
  isGlobal: boolean;
  categoryCollection?: string;
}
```

**Global scenes** (9 cards): Clean Packshot, Soft Neutral Studio, Marketplace-Ready, Editorial, Lifestyle, In-Hand / Human Support, Detail & Coverage, Packaging, Wide / Banner.

**Category collections** (10 groups): Beauty & Skincare, Makeup & Lipsticks, Fragrance, Bags, Hats, Shoes, Garments, Home Decor, Tech, Other. Each contains 3-5 sub-scenes with placeholder previews.

Users multi-select across both sections. Selected scene IDs stored in `selectedSceneIds: Set<string>`.

#### Step 3 — Adaptive Details

13 detail blocks, each shown only when at least one selected scene triggers it (via `triggerBlocks` mapping):

| Block | Triggered by |
|-------|-------------|
| Background & composition | Packshot, Studio, Marketplace, Wide |
| Visual direction | Editorial, Lifestyle |
| Scene environment | Lifestyle, category shelf/bathroom scenes |
| Visible person details | In-Hand, portrait scenes |
| Action details | In-action scenes |
| Detail focus | Detail & Coverage |
| Angle selection | Detail angles |
| Packaging details | Packaging |
| Product size | In-Hand, Lifestyle, interior scenes |
| Branding visibility | All (always shown if 2+ scenes) |
| Layout space | All (always shown) |
| Consistency | Only if multiple products |
| Custom note | Always shown |

Each block is a collapsible card with relevant fields. State stored in a single `detailSettings: Record<string, unknown>` object.

#### Step 4 — Review

Displays: product count, selected scenes list, active detail overrides, total output count (products × scenes), credit estimate.

**Credit calculation**: Reuses the same `6 credits per image` cost from the existing workflow system. Total = `selectedProducts.length × selectedScenes.length × 6`.

#### Step 5 — Generating

Reuses the exact same generation mechanism as product-listing-set:

1. Get auth token
2. Generate a `batch_id`
3. Loop: for each product × scene combo, call `enqueueWithRetry()` with `jobType: 'workflow'`
4. Each job payload includes `workflow_name: 'Product Images'`, the scene instruction, product base64 image, and detail settings
5. Call `sendWake()` after all jobs enqueued
6. Track progress via `multiProductJobIds` map + polling (same as Generate.tsx multi-product path)

**Backend**: Jobs go through the existing `enqueue-generation` → `process-queue` → `generate-workflow` pipeline. The `generate-workflow` edge function already handles arbitrary `selected_variations` and instructions — we just pass our scene instructions as variation data.

#### Step 6 — Results

Grid of generated images grouped by product, with actions: download, upscale, generate more, turn into video.

### Design direction

- Horizontal step indicator at top (numbered dots with labels)
- Large cards with strong selected states (ring-2 ring-primary + checkmark)
- Clean whitespace, grouped sections with subtle borders
- Scene cards: 200px wide, preview image + title + description + mini chips
- Category collections: collapsible sections with header + horizontal scroll of scene cards
- Detail blocks: clean card-based form sections, only visible when relevant
- Smooth transitions between steps

---

## Phase 2 — Admin Tooling (implement after Phase 1 works)

### Admin scene management for Product Images

Extend `/admin/scenes` or create a new admin tab to manage:

- **Scene systems**: CRUD for global scenes (title, description, preview, order, active/inactive, allowed product families, triggered detail blocks)
- **Scene variants inside systems**: Sub-scenes within each system (e.g., Editorial → Surface + backdrop, Pedestal, etc.)
- **Category collections**: Manage which scenes appear in each product category group
- **Detail block triggers**: Admin can toggle which blocks each scene/variant activates
- **Defaults**: Default values for lighting, mood, crop, background, etc.

This requires a new database table:

```sql
CREATE TABLE product_image_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  preview_image_url TEXT,
  chips TEXT[] NOT NULL DEFAULT '{}',
  trigger_blocks TEXT[] NOT NULL DEFAULT '{}',
  is_global BOOLEAN NOT NULL DEFAULT false,
  category_collection TEXT,
  parent_scene_id UUID REFERENCES product_image_scenes(id),
  allowed_product_families TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  defaults JSONB NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

RLS: admins full CRUD, authenticated users read active scenes.

### Admin UI

New tab in AdminScenes or standalone page. Collapsible sections for global scenes and category collections, drag-to-reorder, inline editing, preview image upload.

---

## Execution order

1. Create types + scene data files
2. Create Step 1 (products)
3. Create Step 2 (scenes)
4. Create Step 3 (details)
5. Create Step 4 (review + credits)
6. Create Step 5 + 6 (generating + results)
7. Wire up main page + route
8. Test end-to-end generation flow
9. Phase 2: Admin tooling + database table (separate iteration)

---

## What is NOT changing

- No changes to `enqueue-generation` edge function
- No changes to `process-queue` or `generate-workflow` logic
- No changes to credit calculation in the backend (still 6 credits/image for workflow jobs)
- No changes to existing `product-listing-set` flow (remains untouched)
- No changes to `client.ts` or `types.ts`

