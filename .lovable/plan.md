

## Add "Image Upscaling" Workflow

### Overview
Add a dedicated "Image Upscaling" workflow to the workflows catalog so users can select product images or upload images, choose 2K/4K resolution, and queue upscale jobs through the standard generation pipeline — just like any other workflow.

### Changes

#### 1. Database — Add workflow row
Insert a new system workflow into the `workflows` table:
- **name**: `Image Upscaling`
- **description**: "Enhance any image to 2K or 4K resolution with AI-powered upscaling. Sharpens details, recovers textures, and enhances faces for professional-quality output."
- **required_inputs**: `['product']`
- **recommended_ratios**: `['1:1']` (not relevant but required)
- **uses_tryon**: `false`
- **sort_order**: `60` (after existing workflows)
- **generation_config**: JSON with `ui_config.skip_template: true`, `ui_config.skip_mode: true`, custom setting for resolution picker

#### 2. `src/components/app/WorkflowCard.tsx`
- Add `featureMap` entry for `'Image Upscaling'` with bullet points like:
  - "AI-powered 2K & 4K resolution enhancement"
  - "Face recovery & texture sharpening"
  - "Works with any product or uploaded image"
  - "8 credits for 2K, 12 credits for 4K"

#### 3. `src/components/app/workflowAnimationData.tsx`
- Add a simple scene entry for `'Image Upscaling'` — a before/after style with badges like "2K", "4K", "Enhance"

#### 4. `src/pages/Generate.tsx` — Upscale workflow flow
This is the main change. When `activeWorkflow?.name === 'Image Upscaling'`:

- **Detection**: `const isUpscale = activeWorkflow?.name === 'Image Upscaling';`
- **Source step**: Allow selecting from existing products (reuse existing product picker) OR uploading an image (scratch upload)
- **Settings step**: Simplified — only show resolution picker (2K/4K cards, similar to UpscaleModal) and credit cost summary. No template, no model, no scene, no brand profile
- **Generate handler**: `handleUpscaleWorkflowGenerate()` — converts source image, calls `enqueue-generation` with `jobType: 'upscale'` and payload containing `imageUrl`, `sourceType`, `sourceId`, `resolution`
- **Step flow override**: `source → product/upload → settings → generating` (skip brand-profile, mode, model, pose, template)
- **Multi-product support**: Allow selecting multiple products — each gets queued as a separate upscale job

Key state additions:
- `upscaleResolution: '2k' | '4k'` state variable
- Credit cost calculated as `resolution === '4k' ? 12 : 8` per image

The upscale settings panel will render:
- Resolution picker (2K/4K cards with descriptions and per-image credit cost)
- Selected image preview thumbnail
- Total credit cost summary
- "Enhance" CTA button

#### 5. Credit cost display
- Override `creditCost` calculation when `isUpscale` to use the upscale pricing (8 for 2K, 12 for 4K) per selected product
- Override `workflowImageCount` to be 1 per product (each product = 1 upscale job)

### What stays the same
- Backend: `enqueue-generation` already handles `jobType: 'upscale'`, `process-queue` routes to `upscale-worker`, `upscale-worker` does the Topaz processing — no backend changes needed
- The existing UpscaleModal in the library continues to work independently for quick upscales from library view

### Files modified
1. **Migration SQL** — insert workflow row
2. **`src/components/app/WorkflowCard.tsx`** — add feature bullets
3. **`src/components/app/workflowAnimationData.tsx`** — add animation scene
4. **`src/pages/Generate.tsx`** — add upscale detection, simplified settings step, and upscale generate handler

