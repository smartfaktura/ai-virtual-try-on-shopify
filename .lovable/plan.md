

## Goal
Refine `ProductVisualsGuide` with three specific corrections + add a visual examples section.

## Changes

### 1. Fix Step 03 "Setup" copy
Current: *"Optionally lock a model and Brand Profile."* + *"Keeps palette, mood and styling consistent across runs."*

New:
- **what:** "Pick models, background colors, and fine-tune scene settings."
- **why:** "Adjust per-scene aspect ratios, props, and outfit details before you generate."

(Drop the chip placeholders showing "Model · Brand" — replace with three chips: "Model · Color · Scene")

### 2. Fix Step 04 "Generate" copy
Current: *"Confirm credits, hit Generate."* + *"First image lands in ~30s. 2–4 variations per scene."*

New:
- **what:** "Confirm credits, hit Generate."
- **why:** "Run batches across multiple products and scenes — generate hundreds of studio-grade images in one pass."

(Drop the "~30s" pulse label — replace with a small "×100" or stacked-rectangles motif suggesting batch output)

### 3. Add "Examples" section — new block between Steps and Best for

Pull real assets already shipped in the app to keep this lightweight (no new uploads). Two compact rows:

**A. Models row** — 4 model thumbnails (round or rounded-square, 64×64) with names underneath
- Source: `models` data from `usePresetModels` or the built-in model list (Yuki, Amara, Marcus, Isabella — already used in `PopularCombinations.tsx`)
- Use `getOptimizedUrl(model.previewUrl, { quality: 60 })` + `ShimmerImage`
- Caption above: tiny uppercase eyebrow `MODELS YOU CAN PICK`
- Subtle "+ many more" pill at the end linking to `/app/generate/product-images`

**B. Editorial scenes row** — 4 scene thumbnails (3:4 aspect, ~96px wide) showing variety
- Source: pull 4 curated scenes from existing scene library (e.g., one studio, one lifestyle, one editorial, one prompt-only). Use scene `previewUrl` / `preview_image_url`.
- Caption: tiny uppercase eyebrow `EDITORIAL SCENES — 1000+ AVAILABLE`
- Same hover/fade-in treatment as step cards (staggered `useScrollReveal`)

Both rows live inside one soft panel matching the hub style, so it reads as "Here's a taste" without becoming a gallery.

### 4. Implementation

**One file touched:** `src/components/app/learn/ProductVisualsGuide.tsx`
- Update `STEPS[2]` and `STEPS[3]` text + visual kind
- Replace `chips` visual with 3-chip variant; replace `pulse` visual with batch motif (stacked tiny rectangles + "×100" label)
- Add new `<ExamplesSection />` between the steps section and "Best for / What you'll need"
- Source models from a small curated array (4 hardcoded names lookup) using existing `usePresetModels` hook OR fall back to a hardcoded thumbnail set if the hook isn't trivially available in this context — will check first

**Data source check needed:** Confirm whether `usePresetModels` / `usePresetPoses` are easily importable here or if we should hardcode 4 model thumbs + 4 scene thumbs from public assets. Will inspect during implementation; fallback is simple static array of `{ name, src }`.

No content changes to `learnContent.ts` (corrections are inside the bespoke component's `STEPS` constant).

## Acceptance
- Step 3 reads about backgrounds + models + adjustments (not "lock a Brand Profile")
- Step 4 reads about batch generation, no false "~30s" claim
- New Examples section shows 4 real models + 4 real scenes pulled from the app
- Section uses existing scroll-reveal animation pattern; mobile-friendly grid
- No new dependencies, no asset uploads

