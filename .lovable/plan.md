
## Findings

Yes — there are still 2 real paths in `/catalog` where Seedream can drift to a different face or produce a “brand-model-like but not exact” face in non-close shots.

### 1. Fallback path can reintroduce face blending
In `supabase/functions/generate-catalog/index.ts`:

- Normal derivative flow is now good: if `anchor_image_url` exists, the function sends only `modelIdentityUrl`.
- But if `anchor_image_url` is missing, it falls into the fallback branch and sends:
  - model identity image
  - product image

That means Seedream gets multiple visual references again, which can dilute identity and create a blended/new face.

This can happen because `src/hooks/useCatalogGenerate.ts` still enqueues derivative jobs even when the anchor did not produce an image:
- anchor URL is resolved from `anchorImageMap`
- if missing, derivative still gets queued with `anchorImage_url = null`
- then the edge function uses the fallback multi-image path

So yes: there is still a code path where blended faces can happen.

### 2. Built-in models are weaker identity sources than custom/user models
In `src/pages/CatalogGenerate.tsx`, selected catalog models use:

- `m.sourceImageUrl || m.previewUrl || null`

For built-in models in `src/data/mockData.ts`, they only have `previewUrl`, not a dedicated high-res identity source.

That means:
- custom/user models often use a better source image
- built-in models use a single preview asset only
- in wide/full-body shots, Seedream has less facial detail to lock onto, so it can synthesize a similar-but-different face

This is not classic multi-image blending, but it absolutely can look like “another face matched to our brand model”.

## Conclusion

The current system is improved, but it is not fully safe yet.

There is still a real chance of wrong face identity when:
1. an anchor fails or times out and derivatives still proceed
2. a built-in model only provides a lower-fidelity preview image for identity locking
3. the shot is distant enough that Seedream has little facial information to preserve

## Recommended Fix

### A. Remove the unsafe fallback completely
In `supabase/functions/generate-catalog/index.ts`:
- delete the fallback branch that sends `[modelIdentityUrl, product.imageUrl]`
- on on-model derivatives, allow only:
  - single model identity reference, or
  - fail fast if required reference state is missing

Result:
- no hidden return to multi-image blending

### B. Do not enqueue on-model derivatives when anchor is missing
In `src/hooks/useCatalogGenerate.ts`:
- if an on-model derivative does not have a completed anchor image, do not enqueue it
- mark that shot failed/skipped with a clear error like:
  - “Anchor missing — derivative not generated to protect face consistency”

Result:
- prevents accidental fallback behavior
- protects identity consistency over batch completion

### C. Split model reference into preview vs identity source explicitly
In `src/types/catalog.ts` and the catalog page/hook flow:
- add a dedicated `identityImageUrl` field to `CatalogModelEntry`
- keep `imageUrl` only for UI preview
- pass `identityImageUrl` separately to the edge function

Result:
- cleaner contract
- avoids accidental use of thumbnail/preview assets as identity source

### D. Upgrade built-in models to true identity assets
In `src/data/mockData.ts` or model-loading layer:
- provide a dedicated higher-quality identity image for built-in models
- do not rely on the same preview card image for face locking

Result:
- much stronger identity retention in long shots

### E. Add server logs for actual reference behavior
In `supabase/functions/generate-catalog/index.ts`, log for each job:
- shot id
- whether it is anchor / derivative / product-only
- whether `anchor_image_url` exists
- number of reference images actually sent
- whether the request used model-only, product-only, or fallback mode

Result:
- makes future debugging immediate
- confirms whether bad outputs came from a protected path or fallback path

## Files to update

- `supabase/functions/generate-catalog/index.ts`
  - remove multi-image fallback for on-model derivatives
  - fail fast instead of sending model + product
  - add stronger runtime logging

- `src/hooks/useCatalogGenerate.ts`
  - do not enqueue on-model derivatives if anchor image is missing
  - surface a clear skipped/failed reason in batch state

- `src/types/catalog.ts`
  - add explicit `identityImageUrl` to catalog model entries

- `src/pages/CatalogGenerate.tsx`
  - build model entries with separate preview image and identity image

- `src/data/mockData.ts`
  - optionally add dedicated identity assets for built-in models

## Expected outcome

After these changes:
- Seedream will no longer be able to silently fall back into a multi-reference face-blending path
- distant shots should stop switching to a different “similar” face because the identity source becomes stricter
- built-in and custom models will behave more consistently
- if identity cannot be protected, the job will fail safely instead of generating a wrong face
