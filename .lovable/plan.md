
Problem found:
- Product-only shots are not fully isolated. In `useCatalogGenerate.ts`, product-only shots still inherit `anchorJobId`, and in `supabase/functions/generate-catalog/index.ts` product-only jobs still accept `anchor_image_url`. In mixed sessions that anchor is a person, which is why `ghost_mannequin`, `on_surface`, `styled_flat_lay`, and `back_flat` can pick up faces.
- Pure product-only sessions still force a hidden `front_flat` anchor. That creates an unnecessary second garment reference and can make `back_flat` look like two products merged together.
- `appendPropsToPrompt()` currently injects props into every shot, even strict packshots that already say “ONLY this single product”, which creates contradictory instructions.
- On-model prompts do not strongly enforce “exactly one person only / no duplicated subject / no mirror / no split-screen”, so the model can hallucinate two versions of the same person in one image.

Implementation plan:
1. Split the catalog pipeline into two generation paths.
   - Keep the hidden `identity_anchor` only for on-model shots.
   - Make product-only shots single-phase: no hidden `front_flat` anchor, no `anchor_image_url`, no model reference.
   - In mixed sessions, only on-model shots depend on the anchor; product-only shots stay fully isolated.

2. Add hard server-side protection in `supabase/functions/generate-catalog/index.ts`.
   - If `shot_group === 'product-only'`, send only the product image to the generator.
   - Ignore `anchor_image_url` and model identity for product-only shots even if the client passes them by mistake.
   - Keep the current anchor-based flow only for on-model shots.

3. Strengthen shot prompts in `src/lib/catalogEngine.ts`.
   - Add a reusable on-model block: exactly one model, no second person, no duplicate body, no mirror/reflection, no split-screen, no extra limbs.
   - Add a reusable product-only block: no people, no face, no skin, no body parts, no mannequin head, no duplicate product copies.
   - Add shot-specific rules:
     - `back_view`, `over_shoulder`, `movement`, `walking_motion`: one single subject and one single captured moment, not multi-exposure.
     - `back_flat`: one garment only, back side only, never front+back composite.
     - `ghost_mannequin`: hollow garment shell only, empty openings, never a face/neck/shoulders.
     - `on_surface`, `styled_flat_lay`: tabletop product image only, never a person.
   - Make product-count rules category-aware so shoes can remain a natural pair while apparel/bags/accessories stay a single item.

4. Stop contradictory prop instructions.
   - Add shot metadata like `allowsProps` or `strictIsolation`.
   - Disable/ignore props for strict shots such as `ghost_mannequin`, `front_flat`, `back_flat`, `zoom_detail`, `macro_detail`, and `hardware_detail`.
   - Keep props only for contextual shots where they make sense, such as `on_surface`, `styled_flat_lay`, and selected on-model lifestyle shots.
   - Update the Props step UI so strict ecommerce shots clearly show that props are not allowed.

5. Tighten internal-job visibility.
   - If any internal jobs remain, hide them consistently from counts, review, gallery, and export.
   - Ensure users only see requested outputs once, not an internal anchor plus the requested shot.

Files to update:
- `src/types/catalog.ts`
- `src/lib/catalogEngine.ts`
- `src/hooks/useCatalogGenerate.ts`
- `supabase/functions/generate-catalog/index.ts`
- `src/components/app/catalog/CatalogStepProps.tsx`
- `src/components/app/catalog/CatalogStepReviewV2.tsx`
- `src/pages/CatalogGenerate.tsx` if internal-job filtering needs one more pass

Technical details:
- Best structural fix: make `anchorShotId` optional/null for no-model flows instead of forcing `front_flat`.
- Best safety fix: server-side product-only isolation must be the final authority so faces cannot leak back in from future client changes.
- Best prompt fix: centralize “single human subject” and “single product only” rules, then layer shot-specific anti-hallucination overrides on top.

Expected result:
- On-model shots produce one person only.
- `back_flat` stops blending two garment references together.
- `ghost_mannequin`, `on_surface`, `styled_flat_lay`, and similar product-only shots cannot inherit a face from the selected model.
- Strict packshots stay clean while contextual shots remain flexible without hallucinating.
