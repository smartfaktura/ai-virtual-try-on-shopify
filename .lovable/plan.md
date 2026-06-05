
## Goal

Customer use case (paraphrased from Lithuanian): they have one photo of a sofa/chair and several reference photos showing different upholstery fabrics and colors (e.g. sic.com.pl Anthology collection). They want to generate the same product photo re-rendered in each material — without changing the model, pose, scene, lighting, or camera.

This is the inverse of Product Swap:
- Product Swap = keep the **scene**, swap the **product**.
- Material Swap = keep the **product + scene**, swap the **material/color**.

Primary fit: furniture, upholstered goods, leather goods, sneakers/bags where the silhouette stays constant and only the surface finish changes.

## User flow (3 steps, mirrors Product Swap)

```text
Step 1 — Product photo (the one to re-skin)
  • Three sources, same tab pattern as Product Swap's Scene step:
      – Library  : pick from generated visuals (with search + paging)
      – Products : pick from saved user_products
      – Upload   : drop a new image / paste URL
  • Exactly one image; this is the geometry + scene anchor — never
    altered structurally.

Step 2 — Materials (1..N references)
  • Upload one or more material/fabric/color reference images.
    Each reference becomes one generated variant.
  • Optional per-reference label: "Anthology Sand", "Olive Bouclé", etc.
    (label is free text, prefilled from filename, used in prompt +
    filename).
  • Optional global note: "match weave texture exactly, ignore swatch
    background colour".

Step 3 — Review & generate
  • Aspect ratios: 1:1, 3:4, 4:5, 9:16 (multi-select, same as Product
    Swap).
  • Cost = materials × ratios × PER_IMAGE_COST (6 credits, same as
    Swap).
  • Generate button → enqueues one job per (material × ratio).
```

Results stream into the same in-page job list / lightbox that Product
Swap already uses, grouped under one `batch_id`. Downloads as ZIP with
filenames like `material-swap_<material-label>_<ratio>.png`.

## What gets built

New page + tiny supporting pieces; the heavy lifting reuses existing
infra.

1. `src/pages/MaterialSwap.tsx` — copy of `ProductSwap.tsx` structure
   with:
   - Step 1 = "Product photo" picker with three sources:
     - **Library** tab: reuse the same `LibraryPickerItem` list +
       search + "load more" behaviour that the Scene step already uses
       in Product Swap, just pointed at the user's generated visuals.
     - **Products** tab: reuse the existing `user_products` query +
       grid used by Product Swap's Products step, but in
       single-select mode.
     - **Upload** tab: single-file dropzone (`useFileUpload`), plus URL
       paste, same as the Scene "scratch" option.
     - Selection state collapses to one `productImageUrl` +
       `productTitle` regardless of source.
   - Step 2 = "Materials" multi-upload (replaces the products grid).
     Cap at e.g. 30 materials per batch. Per-row label input + remove.
   - Step 3 = review wording + cost formula `materials × ratios × 6`.
   - Deep link: support `?productImage=<url>&productTitle=...` so the
     Library/Products lightbox can launch Material Swap pre-filled
     (same pattern Product Swap uses for `?scene=`).

2. `src/hooks/useMaterialSwap.ts` — copy of `useProductSwap.ts`, but:
   - Inputs: `productImageUrl`, `productTitle`,
     `materials: { id, imageUrl, label }[]`, `ratios`.
   - Per job payload sent to `enqueue-generation` (jobType `freestyle`,
     same path):
     - `productImage`  = the **material reference** (so the model
       treats it as the dominant material source).
     - `referenceAngleImage` = the **product photo** (geometry/scene
       anchor — same slot Product Swap wires the scene into).
     - `prompt` = new `buildMaterialSwapPrompt(label, userNote)`.
     - `workflow_id: 'material-swap'`,
       `workflow_name: 'Material Swap'`,
       `workflow_label: 'Material Swap — <product title>'`,
       `product_name: <material label>` (groups + labels cleanly in
       the activity feed and library, reusing existing batch
       grouping).
     - `forceProModel: true`, `quality: 'high'`, `imageCount: 1`,
       `isPerspective: true` — same flags Product Swap uses for high
       fidelity.

3. `buildMaterialSwapPrompt(materialLabel, userNote)` — strict
   directive (kept inside the hook, mirrors `buildSwapPrompt`):
   - REFERENCE IMAGE = the product photo. Preserve EVERYTHING: camera,
     framing, crop, lighting, shadows, background, props, pose, model
     identity (if any), product silhouette, geometry, proportions,
     hardware, stitching lines, seams, piping, buttons, legs, feet.
   - FIRST IMAGE = the material/fabric swatch. Apply ONLY the surface
     finish to the product's upholstered/skinnable areas: color, hue,
     weave pattern, texture grain, sheen, pile direction.
   - Do NOT import the reference's background, lighting, or framing.
   - Negatives: do not change shape, proportions, scene, camera, or
     any non-upholstered parts (legs, metal, glass, wood frames keep
     original material unless the swatch clearly describes them).
   - Saugikliai: no text/watermarks/borders, no reinterpretation of
     the product, no zoom/reframe.
   - Append optional user note verbatim at the end.

4. Routing + nav:
   - Add `/app/material-swap` route in the existing app router file
     (same place `product-swap` is registered).
   - Add a sidebar entry near Product Swap, tiny uppercase label per
     the sidebar memory. User-facing name: **Material Swap**.
   - Add a Visual Studio tile so it's discoverable next to Product
     Swap.

5. Memory: add a short feature memory describing the Material Swap
   product/material role swap, the three-source Step 1 picker, and the
   prompt contract, so future edits don't reverse the image slots.

## What we explicitly do NOT change

- No backend changes. `enqueue-generation`, job worker, credit RPC,
  batch grouping, library write-back, lightbox, ZIP download all stay
  as-is — Material Swap is just a new caller of the existing freestyle
  pipeline with a different prompt + reversed image roles.
- No DB schema changes; jobs are tagged via `workflow_id` so filtering
  and activity grouping pick them up automatically.
- No pricing changes; reuses the 6-credit/image Product Swap rate.

## Technical details

- Image slots: the model treats `productImage` as the primary subject
  reference and `referenceAngleImage` as the compositional anchor. For
  Material Swap we deliberately put the **material swatch in
  `productImage`** so the prompt's "preserve every detail of the first
  image" clause locks the fabric, then the prompt overrides
  geometry/scene from the anchor. Same trick Product Swap uses in
  reverse; works with the current Pro model fallback chain.
- Step 1 picker reuses the same components Product Swap's Scene step
  uses — no new library/products fetching code, just rewired for
  single-select of a product image.
- Batching: one `batch_id` per Generate click → activity feed groups
  variants under a single "Material Swap — <product>" entry via the
  existing batch-grouping logic.
- Concurrency / retries: reuse `useProductSwap`'s retry + 429/402
  handling verbatim.
- Filenames: extend `downloadFileName` with a `material-swap` branch
  so the ZIP exports `material-swap_<label>_<ratio>.png`.

## Edge cases handled in the prompt

- Material swatch photographed on a colored background → instruct
  model to extract only the fabric surface, ignore swatch background.
- Multi-material products (e.g. sofa with wooden legs + fabric body)
  → prompt restricts swap to upholstered/soft surfaces; hard
  materials keep their original finish unless the label says
  otherwise.
- Patterned/striped swatches → instruct model to preserve weave scale
  realistically relative to product size, not stretched 1:1.

## Out of scope (good follow-ups, not in this plan)

- Pulling materials directly from a brand's website URL (would need a
  scrape step).
- Per-region masking ("only swap seat cushion, not back").
- Adding Material Swap to Catalog/Bulk pipelines.
- Multi-select product images in Step 1 (one product per batch for
  now).
