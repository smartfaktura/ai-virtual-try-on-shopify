

## Remove Legacy Product Generation Flow

### What's Being Removed

The template-based "product generation" flow is no longer used. Your app now relies on **Freestyle** and **Workflow** generation only. The following dead code will be cleaned up:

### Files to Delete

| File | Reason |
|------|--------|
| `src/hooks/useGenerateProduct.ts` | Hook for legacy product generation -- never imported anywhere |
| `supabase/functions/generate-product/index.ts` | Edge function for legacy product generation |

### Files to Edit

| File | Change |
|------|--------|
| `supabase/functions/process-queue/index.ts` | Remove `product: "generate-product"` from the job type mapping |
| `supabase/functions/enqueue-generation/index.ts` | Remove `"product"` from the `validJobTypes` array |
| `src/hooks/useGenerationQueue.ts` | Remove `'product'` from the `jobType` union type |
| `src/pages/Generate.tsx` | Remove the template-based generation path that uses `jobType: 'product'`. This includes the template selection step, brand tone/background settings step, and the `handleConfirmGenerate` code path that enqueues with `jobType: 'product'`. The page will continue to handle workflow-based and try-on generation as before. |
| `supabase/config.toml` | Remove the `[functions.generate-product]` section |

### What Stays

- **Freestyle generation** (`generate-freestyle` edge function, Freestyle page)
- **Workflow generation** (`generate-workflow` edge function, Generate page with `?workflow=` param)
- **Try-on generation** (`generate-tryon` edge function, Generate page try-on mode)
- **All product management** (Add Product modal, Products page, product CRUD)

### Risk Assessment

Low risk -- the `useGenerateProduct` hook is not imported by any component. The `jobType: 'product'` enqueue call is only in one place in `Generate.tsx`. Existing queued jobs with `job_type = 'product'` that are already completed or failed won't be affected. Any currently processing product jobs will still complete since the edge function processes independently once triggered.

