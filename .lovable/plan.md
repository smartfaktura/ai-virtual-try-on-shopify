
Goal: rebuild Catalog Shot Set into a clear, fast, separate workflow with this exact order:
1) Products → 2) Poses → 3) Models → 4) Backgrounds → 5) Style Shots (Extra tab) → 6) Review & Generate.

Why it currently feels broken (from code + data):
- Only 2 models appear because Catalog currently loads only `custom_models + user_models`; your account has 0 active custom + 2 user models.
- Product thumbnails look “not showing” because many uploads have large transparent/empty canvas; current square thumbnail + fit mode makes the bag tiny.
- “Visual Style” is overloaded (poses + backgrounds + per-shot edit in one page), so flow is confusing.
- Shot styler is partially broken: it filters `pose_` / `scene_` IDs, but catalog IDs are `catalogPose_*` / `catalogBg_*`.
- Shot overrides are collected but not actually applied in generation loop.

Implementation plan (updated to your requested flow)

1) Rebuild step architecture in `CatalogGenerate`
- Replace current 3-step flow with 6-step flow:
  - Step 1: Products
  - Step 2: Poses
  - Step 3: Models
  - Step 4: Main Background(s)
  - Step 5: Style Shots (Extra tab)
  - Step 6: Review
- Add strict step gating so user always understands what comes next.
- Update intro text to explain this exact sequence.

2) Fix model source so full library appears (not only 2)
- In Catalog only, compose models from:
  - built-in library (`mockModels`)
  - + custom models
  - + user models
- Deduplicate and sort with existing model sort hook.
- In model step, separate sections:
  - “Library Models” (main)
  - “My Models” (secondary)
- Keep catalog separate from other workflows for scenes/backgrounds (no shared scene imports).

3) Fix product thumbnail visibility and selection UX
- Create catalog-specific product card/grid (do not rely only on shared compact card behavior):
  - larger portrait thumbnail area
  - checker/neutral backdrop for transparent PNGs
  - image fallback chain: `image_url` → first valid `product_images[]`
  - `onError` fallback to next image
- Keep loading fast by selecting only needed columns and optimized thumbnail URLs.

4) Split Pose step and Background step (as requested)
- Step 2 = only poses.
- Step 4 = only main background(s).
- Keep catalog-only data from `src/data/catalogPoses.ts` (no cross-workflow scenes).
- Keep visual cards simple and understandable (clear selected count + max).

5) Build “Style Shots” step with “Extra” tab (combo-level editing)
- Step 5 shows full Product × Model combo matrix.
- Add tabs:
  - Overrides (pose/background/framing/custom instruction per combo)
  - Extra Items (per combo)
- Extra Items support:
  - text item (e.g. “beige hat”, “gold chain”, “mini bag”)
  - optional reference image from product library (for better fidelity)
  - placement hint (head/hand/shoulder/body/scene)
- Fix ID prefix logic in `CatalogShotStyler` so dropdowns populate for catalog IDs.

6) Make generation actually use style overrides + extras
- Update `useCatalogGenerate` to apply per-combo override before queueing each job.
- Pass `customPrompt`, `framing`, and `extraItems` in payload.
- Update `generate-tryon` function to inject:
  - per-shot custom prompt
  - accessory/extra-item directives
  - optional extra reference images in model input parts.
- This makes Style Shots tab functional, not cosmetic.

7) Performance and clarity improvements
- Remove heavy work from early steps (don’t load everything at once).
- Lazy-render steps (models/backgrounds/style matrix only when user reaches them).
- Keep AI preview generation optional/manual (not automatic burst requests).
- Add compact “current selection summary” sticky bar across steps.

Files to update/create
- Update: `src/pages/CatalogGenerate.tsx`
- Create: `src/components/app/catalog/CatalogStepProducts.tsx`
- Create: `src/components/app/catalog/CatalogStepPoses.tsx`
- Create: `src/components/app/catalog/CatalogStepModels.tsx`
- Create: `src/components/app/catalog/CatalogStepBackgrounds.tsx`
- Create: `src/components/app/catalog/CatalogStepStyleShots.tsx`
- Update: `src/components/app/catalog/CatalogShotStyler.tsx`
- Update: `src/components/app/catalog/CatalogStepReview.tsx`
- Update: `src/hooks/useCatalogGenerate.ts`
- Update: `supabase/functions/generate-tryon/index.ts`
- Optional small helper create/update: catalog product thumbnail card component.

Technical details (important)
- No DB migration required for this pass (style extras can be payload-only).
- Catalog remains isolated from shared scene workflows.
- “Extra item” generation is best-effort AI styling; adding image references improves consistency.
- We will keep credit math transparent in Review based on actual matrix size.

Acceptance criteria
- You can see full model library (not just 2).
- Product cards show clearly (no “invisible/tiny” look).
- Flow is exactly: Products → Poses → Models → Backgrounds → Style Shots (Extra tab) → Review.
- Style Shots changes materially affect generated output.
- Background selection is its own dedicated step.
