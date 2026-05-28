## Findings

The last phone-case batch for `info@tsimkus.lt` confirms the issue is not scene-specific: some outputs preserve the case/camera layout, others invent or shift the phone camera hardware.

Main root cause:
- Product Images uses `analyze-product-category`, not `analyze-product-image`
- Our previous `deviceModel` detection was added to `analyze-product-image`, so it never reaches `/app/generate/product-images`
- The latest queue payloads for `Orange Striped iPhone Case` have `deviceModel: null` and no camera layout field
- The prompt has a generic “Critical device lock”, but no concrete camera-layout description like lens count, camera island shape, sensor/flash positions, or orientation/no-mirror lock

## Plan

1. **Add phone-case compatibility analysis to the correct analyzer**
   - Update `supabase/functions/analyze-product-category/index.ts`
   - For `phone-cases`, return additional fields:
     - `deviceModel`
     - `cameraLayoutDescription`
     - `lensCount`
     - `lensArrangement`
     - `cameraIslandShape`
     - `cameraCutoutPosition`
   - Example output: “iPhone Pro-style triple lens square camera island, top-left on back-facing phone, rounded rectangle/square bump, flash and sensor preserved”

2. **Invalidate stale phone-case analysis only where needed**
   - Update `src/hooks/useProductAnalysis.ts`
   - Keep existing cached analysis for normal products
   - Force re-analysis only for `phone-cases` when the new camera fields are missing
   - This avoids unnecessary re-analysis for every other category

3. **Carry the new fields through TypeScript and generation payloads**
   - Update `src/components/app/product-images/types.ts`
   - Add optional phone-case fields to `ProductAnalysis`
   - ProductImages already passes `analysis` into the generation payload, so no payload redesign is needed

4. **Strengthen phone-case prompt locking in both prompt layers**
   - Update `src/lib/productImagePromptBuilder.ts`
   - Add a final phone-case validation block near the end of the dynamic prompt:
     - back-facing case is default
     - do not mirror/flip camera position
     - preserve exact lens count/arrangement/cutout position
     - nails/outfit can use product color, but must never cover or visually replace the camera module
   - Update `supabase/functions/generate-workflow/index.ts`
   - Expand `PHONE CASE FIDELITY` to include the new analysis fields when available

5. **Fix saved job metadata for easier future debugging**
   - Queue-generated jobs currently save `prompt_final: null`, which makes debugging harder
   - Store the final built prompt in queue completion metadata so future bad outputs can be inspected directly from `generation_jobs`

## Validation

After implementation:
- Re-analyze the orange phone case product so the new camera fields are stored
- Generate a small 3–4 image case batch
- Confirm the queue payload includes `deviceModel` and `cameraLayoutDescription`
- Confirm generated outputs keep the same camera island orientation, lens count, and case cutout position
- Confirm non-phone-case products are unchanged