
Goal

Make `/app/generate/product-images` truly generate from the selected product/scenes/refine inputs, and clean up the Review step UX.

What I found

- The core reference-image mechanism is valid: the frontend converts the selected product image to base64, sends it in the payload, and `generate-workflow` passes reference images into Gemini as inline image inputs.
- The biggest problem is not the idea of the prompt system now — it is the wiring into the backend contract.
- Critical backend contract bugs in `src/pages/ProductImages.tsx`:
  - `workflow_id` is missing
  - `selected_variations` is sending `{ label, instruction }` objects, but `generate-workflow` expects numeric indices
- That means Product Images is currently at high risk of failing before generation or producing zero usable variations.
- Several important refine/reference inputs still are not reaching the generator:
  - selected model image
  - packaging reference image
  - scene prop products
  - per-scene aspect overrides
- Reference handling can be made more reliable:
  - `generate-workflow` sends multiple images to Gemini, but it does not explicitly label each image part before the inline image
  - prompts mention `[PRODUCT IMAGE]`, `[MODEL IMAGE]`, etc., but the request currently relies too much on implicit image order
- Review step still uses a worse thumbnail renderer than the selection flow/context strip, which is why narrow products turn into unreadable strips.

Implementation plan

1. Fix the Product Images → queue → generator contract
- Update `src/pages/ProductImages.tsx` to send the real shape expected by the generation backend:
  - include `workflow_id`
  - stop sending objects inside `selected_variations`
  - map local Product Images scenes into `extra_variations` plus valid numeric selection, following the working pattern already used in `src/pages/Generate.tsx`
- Keep one generated instruction per selected scene using `buildDynamicPrompt(...)`
- Pass the live product analysis summary with each product payload

2. Make all selected references actually reach the model
- In `src/pages/ProductImages.tsx`, resolve and send:
  - primary product image
  - selected model reference image when `selectedModelId` is used
  - packaging reference image when uploaded
  - prop products as additional product references
  - scene preview/reference image when supported
  - per-scene aspect ratio override instead of only the global ratio
- Ensure Product Images payloads include the exact refs needed for each chosen scene

3. Tighten multimodal prompt engineering
- In `supabase/functions/generate-workflow/index.ts`, explicitly label each image before sending it to Gemini, for example:
  - `[PRODUCT IMAGE] Primary product reference`
  - `[MODEL IMAGE] Identity reference`
  - `[PACKAGING REFERENCE] Packaging fidelity reference`
  - `[SCENE REFERENCE] Composition/style reference`
- Add analyzed product attributes into the final prompt shell when available:
  - category
  - material
  - finish
  - color family
  - size class
- Re-check Product Images prompt wrapping so the local scene prompt and backend shell do not fight each other; if needed, use a neutral dedicated workflow shell for this route

4. Fix Review-step scroll behavior
- Move the scroll target in `src/pages/ProductImages.tsx` higher so entering Review scrolls to the top of the wizard shell, not just the inner content block
- Make Edit-jumps also land at the top of the step content

5. Rebuild Review thumbnails using the same product display logic
- Replace the current Review thumbnail rendering in `src/components/app/product-images/ProductImagesStep4Review.tsx`
- Reuse the same thumbnail system used in the product-selection/context-strip flow:
  - square stage
  - white background
  - `object-contain`
  - readable tile size
- Ideally extract one shared product thumbnail component so selection, strip, and review stay consistent

Files to update

- `src/pages/ProductImages.tsx`
- `src/components/app/product-images/ProductImagesStep4Review.tsx`
- `supabase/functions/generate-workflow/index.ts`
- possibly `src/components/app/product-images/ProductContextStrip.tsx` or a new shared thumbnail component
- possibly a workflow seed/migration if this route needs a dedicated neutral workflow record

Technical notes

- Current intended generation path is:
  `ProductImages.tsx -> buildDynamicPrompt -> enqueue-generation -> process-queue -> generate-workflow -> buildVariationPrompt -> Gemini generateContent`
- The product reference image is already intended to be a real AI reference, not just text.
- The main blocker is that Product Images currently does not satisfy `generate-workflow`’s expected payload shape.
- The raw scene prompt engineering is much better than before; the remaining critical work is getting the correct references and payload into the actual generator.

Acceptance checks

- One product + one scene generates successfully end-to-end
- Multi-scene generation produces the correct scene-specific prompt each time
- Selected model scenes actually use the chosen model image
- Packaging scenes actually use the uploaded packaging reference
- Prop products actually reach the model as references
- Review always scrolls to the top
- Review thumbnails match the selection-style display and no longer appear as thin strips
