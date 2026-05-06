
# Bundle Visuals Workflow

## Feasibility & Risk Assessment

**Good news:** The hardest parts already exist. The `generate-workflow` edge function already handles `additional_products` (multi-image references to Gemini 3 Pro), and the `buildVariationPrompt` function already constructs `ADDITIONAL PRODUCTS IN COMPOSITION` blocks with per-product labeling. The generation queue, credit system, and library all work unchanged.

**Effort estimate:** Medium. ~70% infrastructure reuse, ~30% new code (mostly UI + prompt builder adaptation + scenes).

**Platform safety:** Zero risk of breaking existing flows — this is an additive feature (new page, new prompt builder file, new scenes inserted into existing table). No schema changes needed.

---

## What Gets Built

### 1. New page: `/app/bundles` (Bundle Visuals)

A 4-step wizard forked from `ProductImages.tsx` with these differences:

| Step | Product Images (current) | Bundle Visuals (new) |
|------|------------------------|---------------------|
| 1. Products | Select 1+ products (each generates separately) | Select 2-5 products (all compose into one image). Option to upload a single bundle photo instead |
| 2. Shots | 860+ scenes, category-filtered | 12 bundle-specific scenes only (`category_collection = 'bundle'`) |
| 3. Setup | Per-product settings | Bundle-level: arrangement style, hero product picker, background/lighting |
| 4. Generate | N products × M scenes = N×M jobs | 1 bundle × M scenes = M jobs (each job references all products) |

**Hero product:** User taps one product as "primary" — it gets the main `product` payload field. Others go into `additional_products`. This maps directly to existing edge function logic.

### 2. Prompt engineering: `buildBundlePrompt()`

New file `src/lib/bundlePromptBuilder.ts`. Reuses lighting/shadow/background maps from `productImagePromptBuilder.ts` via shared imports.

**Realistic scale system** — the critical part:

```
BUNDLE SCALE CALIBRATION (MANDATORY):
Each product has a real-world size class from AI analysis.
- very-small (3-8cm): jewelry, rings, earbuds, lip balm
- small (8-20cm): perfume bottles, wallets, phones, skincare tubes
- medium (20-40cm): shoes, handbags, books, tablets
- large (40-80cm): backpacks, guitars, laptops
- extra-large (80cm+): furniture, luggage, large electronics

PROPORTIONAL RULE: Products in this bundle have these sizes:
- [Product 1]: {{title}} — {{sizeClass}} ({{dimensions}})
- [Product 2]: {{title}} — {{sizeClass}} ({{dimensions}})
...

Render each product at its CORRECT relative scale. A perfume bottle (small)
next to a handbag (medium) must be ~3x smaller. A lipstick next to a laptop
must be ~8x smaller. Use the real-world size classes above — NEVER render
products at equal sizes unless they actually are similar sizes.

SPATIAL ANCHORS: Use a known reference for scale calibration:
- Flat compositions: A4 paper = 21×30cm, standard dinner plate = 27cm
- Lifestyle scenes: doorframe = 210cm, table height = 75cm, countertop depth = 60cm
```

**Arrangement directives** (user-selectable):

- **Grid** — evenly spaced grid, hero product centered and slightly larger
- **Cascade** — diagonal waterfall arrangement, largest to smallest
- **Nested** — products grouped tightly as a curated collection, touching/overlapping edges
- **Radial** — hero product center, others arranged in a semi-circle around it
- **Natural** — lifestyle scatter as if someone just unpacked them

### 3. Database: 12 bundle scenes

Inserted into `product_image_scenes` via insert tool (no schema migration needed):

**Flat compositions (6):**
1. **Minimal White Grid** — seamless white, overhead, clean grid
2. **Warm Linen Flatlay** — textured linen, soft daylight, editorial overhead
3. **Marble Cascade** — polished marble surface, diagonal cascade
4. **Dark Editorial Grid** — matte black surface, dramatic side lighting
5. **Kraft Unboxing** — open gift box with tissue paper, products arranged inside/around
6. **Terrazzo Display** — colorful terrazzo surface, modern retail aesthetic

**Lifestyle scenes (6):**
7. **Gifting Moment** — hands presenting products on a table, warm side light
8. **Vanity Shelf Display** — marble bathroom shelf, products arranged naturally
9. **Kitchen Counter Set** — stone kitchen counter, morning light, culinary/wellness bundle
10. **Bedroom Nightstand** — bedside table, warm lamp light, self-care bundle
11. **Boutique Window** — shop window display, diffused backlight, retail staging
12. **Outdoor Picnic Spread** — blanket on grass, golden hour, lifestyle spread

Each scene prompt template includes:
- `BUNDLE SCALE CALIBRATION` block (as above)
- `MULTI-PRODUCT ARRANGEMENT` with scene-specific layout (e.g., "overhead grid" for flat, "shelf depth" for lifestyle)
- `PRODUCT COUNT ENFORCEMENT`: "This image must contain EXACTLY {{productCount}} distinct, identifiable products"
- `NO LOGOS OR TEXT` directive

### 4. Edge function: zero changes needed

The existing `generate-workflow/index.ts` already:
- Accepts `additional_products[]` with `imageUrl`, `title`, `productType`
- Passes all product images as Gemini reference images (lines 1296-1302)
- Forces `gemini-3-pro-image-preview` when `additional_products` is present (line 1208)
- Builds `ADDITIONAL PRODUCTS IN COMPOSITION` prompt block (lines 293-300)

The bundle prompt builder on the frontend will construct the `extra_variations[].instruction` with all the scale/arrangement logic. The edge function just passes it through.

### 5. Frontend payload construction

In `BundleVisuals.tsx`, the generation loop is simpler than Product Images:

```
for each scene:
  payload = {
    workflow_name: 'Bundle Visuals',
    workflow_slug: 'bundle-visuals',
    product: heroProduct (with base64 image + analysis),
    additional_products: otherProducts (each with base64 image),
    extra_variations: [{ instruction: buildBundlePrompt(...), ... }],
    quality: 'high',
    aspectRatio: selected,
    batch_id: batchId,
    scene_name: scene.title,
    scene_id: scene.id,
  }
  enqueueWithRetry(payload)
```

One job per scene (not per-product). 5 products × 3 scenes = 3 jobs (not 15).

### 6. Sidebar entry

Add under Visual Studio section with `Gift` icon (from lucide-react). Route: `/app/bundles`.

### 7. Credit cost

6 credits per image (same as Product Images). Bundle images are single generations — the cost is per output image, not per input product.

---

## Safety Guardrails

| Risk | Mitigation |
|------|-----------|
| Too many reference images crashing Gemini | Cap at 5 products (5 base64 images). Gemini 3 Pro handles 10+ images — well within limits |
| Oversized payloads | Each base64 product image is ~200KB compressed. 5 products = ~1MB. Edge function already handles this for model + scene + product refs |
| Prompt too long | Bundle prompt builder caps at ~800 words. Existing prompts hit 600+ with all saugikliai — tested and stable |
| Products rendered at wrong scale | Triple-layer enforcement: sizeClass from analysis + explicit dimensions + spatial anchors. Same pattern used successfully in furniture/dining scenes |
| Breaking existing Product Images flow | Zero shared state. New page, new prompt builder file, new route. Product Images code is untouched |
| Breaking generation queue | Same `enqueueWithRetry` + same `enqueue_generation` RPC. Job type remains `workflow`. No queue schema changes |

---

## Files Summary

**New files (3):**
- `src/pages/BundleVisuals.tsx` — wizard page (~600 lines, forked from ProductImages with bundle logic)
- `src/lib/bundlePromptBuilder.ts` — multi-product prompt construction (~300 lines)
- `src/components/app/bundle-visuals/BundleProductPicker.tsx` — hero selector + multi-product grid

**Modified files (2):**
- `src/App.tsx` — add `/app/bundles` route
- `src/components/app/AppShell.tsx` — add sidebar entry

**Database (insert only, no migrations):**
- 12 rows in `product_image_scenes` via insert tool

**Edge functions: no changes**
