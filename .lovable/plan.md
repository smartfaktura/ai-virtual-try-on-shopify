
Goal: fix Product Listing Set scene handling so prompt-only scenes still produce correct scene context, optionally use scene reference images when available, and remove the leaked UI text line.

1) Root-cause fixes (what to build)
- In `src/pages/Generate.tsx`, harden dynamic scene mapping for Product Listing Set:
  - Add a scene-instruction fallback chain so `instruction` is never empty:
    1) `scene.promptHint` (trimmed),
    2) `scene.description` (trimmed),
    3) generated fallback from scene name/category (e.g. “Place the product in a [scene name] environment…”).
  - When mapping freestyle scenes into `variationStrategy.variations`, include metadata fields for backend control:
    - `preview_url`
    - `prompt_only` (from scene)
    - `use_scene_reference` (`true` only when not prompt-only and preview exists).
- Keep the existing index remap logic, but ensure `extra_variations` are normalized with non-empty instructions before enqueue.

2) Backend generation reliability
- In `supabase/functions/generate-workflow/index.ts`:
  - Extend `VariationItem` type with optional `preview_url`, `prompt_only`, `use_scene_reference`.
  - Add server-side normalization so empty `variation.instruction` gets a safe fallback from label/category (protects old/bad records even if frontend misses).
  - In per-variation generation loop, include scene image reference only when:
    - `variation.use_scene_reference === true`
    - `variation.preview_url` exists
    - `variation.prompt_only !== true`
  - Keep product image as primary reference; scene reference is additive style/context only.

3) Prevent future bad scene records
- In admin scene creation UIs:
  - `src/components/app/AddSceneModal.tsx`
  - `src/pages/AdminSceneUpload.tsx`
- Enforce prompt quality for prompt-only scenes:
  - If `promptOnly=true` and prompt hint empty, block save with clear validation.
  - If prompt hint empty but description exists, auto-fill prompt hint from description.
  - If both empty, fallback to scene name-derived hint before save.
- This stops future “blank instruction” scenes.

4) Fix visible UI bug
- In `src/pages/Generate.tsx`, remove the stray rendered text:
  - `const visibleProducts = filteredProducts.slice(0, visibleProductCount);`
- This line is currently leaking into the Results view as plain text and must be deleted.

5) Verification plan (end-to-end)
- Re-test Product Listing Set with:
  - `Skyline Laundry` (prompt-only, currently empty prompt fields) → confirm scene direction is applied and output quality improves.
  - One non-prompt-only custom scene with image → confirm scene image is used as context reference.
- Confirm queue payload contains non-empty `extra_variations[].instruction`.
- Confirm no leaked `visibleProducts` text appears in results UI.
- Confirm existing non-custom workflow variations still generate as before.

Technical details
- No database schema migration is required for this fix (logic + validation only).
- Existing RLS/policies remain unchanged.
- Backward compatibility: backend fallback prevents failures for legacy custom scenes already saved with empty `prompt_hint` and empty `description`.
