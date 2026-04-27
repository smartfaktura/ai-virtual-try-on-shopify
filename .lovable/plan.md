
# Fix `first_generation_started` Across All Generation Flows (with safety adjustments)

## Audit summary

`gtmFirstGenerationStarted` (in `src/lib/gtm.ts`) is **persistently deduped per user** via `gtm:firstgen-started:{user_id}` and **automatically appends `page_location: window.location.href`** in its payload. Safe to call from every enqueue path — only the first successful job (any flow) wins.

Currently wired only in `useGenerationBatch.ts`. All other enqueue paths are missing it.

| Flow | Page | Hook / function that creates the job | Wired? |
|---|---|---|---|
| Product Visuals (multi-batch) | `/app/generate/product-images` (`Generate.tsx`) | `useGenerationBatch.startBatch` | ✅ already |
| Product Visuals (single path) + Freestyle + Text-to-Product + Single Video | `Generate.tsx` / `Freestyle.tsx` / `TextToProduct.tsx` / `useGenerateVideo` | `useGenerationQueue.enqueue` | ❌ |
| Perspectives | `Perspectives.tsx` | `useGeneratePerspectives.generate` | ❌ |
| Catalog Studio | `CatalogGenerate.tsx` | `useCatalogGenerate` → `enqueueOne` | ❌ |
| Upscale | enhance flow | `useUpscaleImages.upscaleImages` | ❌ |
| Bulk Video | bulk video flow | `useBulkVideoProject.runBulkAnimatePipeline` | ❌ |
| Short Film | `/app/video/short-film` | `useShortFilmProject` (2 enqueue sites) | ❌ |

## Safety rules applied to every fire site

1. Fire **only after** `!isEnqueueError(result) && result.jobId && user.id` — three explicit checks.
2. Payload: `{ userId, productId: <value or null>, generationId: result.jobId, visualType }` — helper auto-attaches `page_location`.
3. Local `firstgenFired` guard (where loops exist) is set **after** the successful fire, never before. A failed enqueue cannot block tracking of a later successful one.
4. Persistent dedup `gtm:firstgen-started:{user_id}` in localStorage (with in-memory fallback) — already provided by helper.
5. Never fire from: button click before success, page_view/history change, library/history loaders, old completed jobs.
6. Dev-only `console.debug('[GTM:firstgen-started] <flow>', { jobId, productId, visualType })` for verification. Production silent (gated on `import.meta.env.DEV`).

## Files to edit

### 1. `src/hooks/useGenerationQueue.ts`
- Add import: `import { gtmFirstGenerationStarted } from '@/lib/gtm';`
- In `enqueue()`, immediately after `const result = res as unknown as EnqueueResult;` (line 459) and before `setActiveJob(...)`:

```ts
if (user?.id && result?.jobId) {
  const productId = (params.payload as Record<string, unknown>).product_id as string | undefined;
  const visualType =
    ((params.payload as Record<string, unknown>).workflow_name as string) ||
    ((params.payload as Record<string, unknown>).workflow_slug as string) ||
    params.jobType;
  if (import.meta.env.DEV) {
    console.debug('[GTM:firstgen-started] queue', { jobId: result.jobId, productId: productId ?? null, visualType });
  }
  gtmFirstGenerationStarted({
    userId: user.id,
    productId: productId ?? null,
    generationId: result.jobId,
    visualType,
  });
}
```

### 2. `src/hooks/useGeneratePerspectives.ts`
- Add import for `gtmFirstGenerationStarted`.
- Declare `let firstgenFired = false;` near the top of `generate()` (after `let lastNewBalance`).
- Inside the inner enqueue loop, immediately after `jobs.push({ jobId: result.jobId, ... })` (line ~471):

```ts
if (!firstgenFired && user?.id && result?.jobId) {
  if (import.meta.env.DEV) {
    console.debug('[GTM:firstgen-started] perspectives', { jobId: result.jobId, productId: product.id });
  }
  gtmFirstGenerationStarted({
    userId: user.id,
    productId: product.id ?? null,
    generationId: result.jobId,
    visualType: 'perspectives',
  });
  firstgenFired = true; // set AFTER successful fire
}
```

### 3. `src/hooks/useCatalogGenerate.ts`
- Add import for `gtmFirstGenerationStarted`.
- In `enqueueOne`, just before `return { jobId: result.jobId, ... }` (line ~395), inside an `if (!isEnqueueError(result))` branch (which is already true at that point):

```ts
if (user?.id && result?.jobId) {
  if (import.meta.env.DEV) {
    console.debug('[GTM:firstgen-started] catalog', { jobId: result.jobId, productId, shotId });
  }
  gtmFirstGenerationStarted({
    userId: user.id,
    productId: productId ?? null,
    generationId: result.jobId,
    visualType: 'catalog',
  });
}
```
Helper-level dedup means only the first successful catalog enqueue across the user's lifetime fires.

### 4. `src/hooks/useUpscaleImages.ts`
- Add import for `gtmFirstGenerationStarted`.
- After `jobIds.push(result.jobId)` (line 95), still inside the `if (!isEnqueueError(result))` branch:

```ts
if (jobIds.length === 1 && user?.id && result?.jobId) {
  if (import.meta.env.DEV) {
    console.debug('[GTM:firstgen-started] upscale', { jobId: result.jobId });
  }
  gtmFirstGenerationStarted({
    userId: user.id,
    productId: null,
    generationId: result.jobId,
    visualType: 'upscale',
  });
}
```

### 5. `src/hooks/useBulkVideoProject.ts`
- Add import for `gtmFirstGenerationStarted`. (`userId` is already extracted at line 57.)
- Declare `let firstgenFired = false;` after `let failed = 0;` (line 69).
- Right after line 211 (successful `enqueueWithRetry`), inside the `if (!isEnqueueError(result))` branch (i.e., after line 218's `continue`-or-not check):

```ts
if (!firstgenFired && userId && result?.jobId) {
  if (import.meta.env.DEV) {
    console.debug('[GTM:firstgen-started] bulk_video', { jobId: result.jobId });
  }
  gtmFirstGenerationStarted({
    userId,
    productId: null,
    generationId: result.jobId,
    visualType: 'bulk_video',
  });
  firstgenFired = true;
}
```

### 6. `src/hooks/useShortFilmProject.ts`
- Add import for `gtmFirstGenerationStarted`.
- Add a module-scoped `useRef<boolean>(false)` `firstgenFiredRef` inside the hook.
- After both `enqueueWithRetry` success points (lines ~538 and ~1065), guarded by the existing `if (isEnqueueError(result)) throw` so by then `result.jobId` is valid:

```ts
if (!firstgenFiredRef.current && user?.id && result?.jobId) {
  if (import.meta.env.DEV) {
    console.debug('[GTM:firstgen-started] short_film', { jobId: result.jobId });
  }
  gtmFirstGenerationStarted({
    userId: user.id,
    productId: null,
    generationId: result.jobId,
    visualType: 'short_film',
  });
  firstgenFiredRef.current = true;
}
```

## Reporting (after implementation)

### Files changed
1. `src/hooks/useGenerationQueue.ts`
2. `src/hooks/useGeneratePerspectives.ts`
3. `src/hooks/useCatalogGenerate.ts`
4. `src/hooks/useUpscaleImages.ts`
5. `src/hooks/useBulkVideoProject.ts`
6. `src/hooks/useShortFilmProject.ts`

### Flows now covered
- Product Visuals (batch + single)
- Freestyle
- Text-to-Product
- Perspectives
- Catalog Studio
- Upscale
- Single Video
- Bulk Video
- Short Film

### Sample GTM Preview payload — Product Visuals
```json
{
  "event": "first_generation_started",
  "user_id": "8c1b4e92-2f3a-4b6e-9c2d-1a7e3f5d8b9a",
  "product_id": "p_4f2c8e1a-3b9d-4e6f-8a2c-7d1e9f3b5c4a",
  "generation_id": "j_2a8d4c6e-1f9b-4e3a-8c5d-7b1f9a3e2c4d",
  "visual_type": "Product Listing Set",
  "page_location": "https://vovv.ai/app/generate/product-images"
}
```

### Sample GTM Preview payload — Freestyle
```json
{
  "event": "first_generation_started",
  "user_id": "8c1b4e92-2f3a-4b6e-9c2d-1a7e3f5d8b9a",
  "generation_id": "j_5e7c2a4d-9b1f-4e3a-8c5d-7b1f9a3e2c4d",
  "visual_type": "freestyle",
  "page_location": "https://vovv.ai/app/freestyle"
}
```
(Note: `product_id` is omitted entirely when `null`, per the helper — see `gtm.ts` line 109. If you want it always present even as `null`, say so and we'll change the helper.)

## How to test in GTM Preview

For a brand-new account (or after clearing `localStorage` key `gtm:firstgen-started:{your_user_id}`):

1. Sign in. DevTools → Application → Local Storage → confirm `gtm:firstgen-started:{user_id}` is **absent**.
2. Open GTM Preview / Tag Assistant attached to GTM-P29VVFW3.
3. Trigger one flow. Expected in **Data Layer** tab: a single `first_generation_started` event with `user_id`, `generation_id`, `visual_type`, and `page_location`.
4. **At this stage we only expect to see the `dataLayer` event `first_generation_started` in GTM Preview.** Tags Fired can be **None** for now — Custom Event triggers and Google Ads conversion tags have not been created yet, so `/g/collect` and conversion network hits are not expected.
5. Trigger a second generation in the same or different flow → `dataLayer` should NOT receive a second `first_generation_started`. DevTools console will show `[GTM] dedup skip first_generation_started …`.
6. Per flow `visual_type` to expect:
   - Product Visuals → workflow name (e.g. `"Product Listing Set"`)
   - Freestyle → `"freestyle"`
   - Text-to-Product → `"freestyle"` (jobType) unless workflow name on payload
   - Perspectives → `"perspectives"`
   - Catalog → `"catalog"`
   - Upscale → `"upscale"`
   - Single Video → `"video"`
   - Bulk Video → `"bulk_video"`
   - Short Film → `"short_film"`
