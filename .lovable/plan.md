

## Monthly Credit Reset for Paid Plans — Implemented ✅

### What was built
Billing cycle rollover detection in `check-subscription` that resets credits to the plan's monthly allotment when Stripe renews. Use-it-or-lose-it model — old unused credits expire.

### Changes
- **Database**: Added `credits_renewed_at` column to `profiles`, created `reset_plan_credits` RPC
- **`check-subscription`**: Compares new `periodEnd` from Stripe against stored `current_period_end`. If plan unchanged but period differs → `reset_plan_credits(allotment)`
- **Free plan**: Unaffected (20 credits at signup, no renewal)


## Product Perspectives — Implemented ✅

### What was built
A new **Product Perspectives** workflow that generates angle and detail variations (Close-up, Back, Left Side, Right Side, Wide/Environment) from existing product images.

### Key features
- **Multi-product support**: Select multiple products from library, each generates its own batch
- **Multi-ratio support**: Select multiple aspect ratios (1:1, 3:4, 4:5, 9:16)
- **Direct upload**: Upload a new image instead of picking from product library
- **Conditional reference uploads**: When "Back Angle" is selected, an upload zone appears for the user to optionally provide a back reference image for accuracy
- **Left/Right side optional references**: Available via "Add reference image" link
- **Credits**: 4 credits/image (standard), 8 credits/image (high quality)
- **Standalone routing**: Workflow card routes to `/app/perspectives` instead of generic Generate page

### Prompt Engineering Fixes (v2) ✅
- **Skip generic polisher**: `polishPrompt: false` — full prompt built in the hook with strict product identity rules
- **Force Pro model**: `forceProModel: true` + `isPerspective: true` flags ensure `gemini-3-pro-image-preview` is always used
- **Angle-aware reference images**: `referenceAngleImage` field (not `sourceImage`) so references are treated as product identity, not scene inspiration
- **Cross-angle consistency**: Explicit studio lighting and neutral background instructions across all angles
- **Default quality**: Changed from `standard` to `high`

### Files changed
- **Database migration**: Inserted "Product Perspectives" workflow row
- `src/pages/Perspectives.tsx` — Full page with product picker, angle checkboxes, ratio multi-select, conditional reference uploads
- `src/hooks/useGeneratePerspectives.ts` — Multi-product × multi-ratio × multi-angle batch enqueue with strict perspective prompt builder
- `src/components/app/LibraryDetailModal.tsx` — Added "Generate Perspectives" button
- `src/App.tsx` — Added `/app/perspectives` route
- `supabase/functions/generate-freestyle/index.ts` — Perspective detection, skip polish, force pro model, handle `referenceAngleImage`


## Image Optimization for AI Generation — Implemented ✅

### What was built
**"Optimize once, use forever"** strategy for model & scene images sent to AI generation. Product images stay full-resolution to preserve text, labels, and fine details.

### What gets optimized (1536px, quality 80)
- `modelImage` — AI model reference (pose/body only)
- `sceneImage` — environment/mood reference

### What stays full resolution (untouched)
- `productImage` — product details, text, labels
- `sourceImage` — user's own product photo
- `referenceAngleImage` — user's product from a specific angle

### Changes
1. **Database**: Added `optimized_image_url` column to `custom_models` and `custom_scenes`
2. **Hooks**: `useCustomModels.ts` and `useCustomScenes.ts` compute optimized render URL on save
3. **Types**: `ModelProfile` and `TryOnPose` now carry `optimizedImageUrl?`
4. **Edge functions**: `generate-freestyle` and `generate-tryon` apply `optimizeImageForAI()` to model & scene URLs only
5. **Reliability**: `max_tokens: 8192` added to both functions; automatic fallback to `gemini-3.1-flash-image-preview` if Pro model returns null
