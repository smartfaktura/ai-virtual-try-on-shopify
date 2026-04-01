

# Catalog Studio — Resilience, Dedicated Queue, and Bug Fixes

## Critical Bugs Found

### Bug 1: Catalog jobs enqueued as `jobType: 'tryon'` — wrong credit cost
In `useCatalogGenerate.ts` line 135, jobs are sent as `jobType: 'tryon'`. The `enqueue-generation` function charges **6 credits** per `tryon` image (line 45-46), but the UI shows **4 credits**. Users are overcharged by 50%.

**Fix**: Change `jobType` from `'tryon'` to `'catalog'` and add `catalog` as a valid job type in `enqueue-generation` with a 4-credit cost.

### Bug 2: `generate-catalog` rejects product-only mode
The `generate-catalog` edge function validates that `body.model.imageUrl` is present (line 257). In product-only mode, no model is sent. The job would fail with a 400 error.

**Fix**: Make model fields optional in `generate-catalog`. When no model is provided, generate product-only shots (ghost mannequin, flat lay, etc.) without model reference images.

### Bug 3: `generate-catalog` ignores `prompt_final` from catalog engine
When catalog jobs come through `generate-tryon` via `catalog_mode`, the pre-assembled `prompt_final` is used correctly. But when routed through the dedicated `generate-catalog` function, it rebuilds the prompt from scratch using `buildCatalogPrompt()` — completely ignoring the sophisticated prompt from the catalog engine (fashion style, support wardrobe, shot-specific templates). All the engine work is wasted.

**Fix**: In `generate-catalog`, check for `prompt_final` first and use it. Fall back to `buildCatalogPrompt()` only for legacy/non-engine calls.

### Bug 4: No client-side polling timeout
Polling runs forever via `setInterval` with no maximum duration. If a job gets stuck in `processing` and the cleanup job doesn't catch it, the user's browser polls indefinitely.

**Fix**: Add a 10-minute hard timeout that force-completes the batch with whatever results exist.

### Bug 5: No error handling for base64 conversion failures
`convertImageToBase64` is called for every product and model image during enqueue. If any conversion fails (network error, CORS, large image), the entire batch silently breaks — no error is surfaced.

**Fix**: Wrap each `convertImageToBase64` call in try/catch, skip that product/model with a toast warning, and continue with the rest.

---

## New Feature: Dedicated Catalog Queue

Currently catalog jobs share the queue with all other generation types. Since catalog uses Seedream exclusively (no Gemini fallback chain), they should be separated to avoid blocking or being blocked by other job types.

### Changes:

**1. `enqueue-generation/index.ts`**
- Add `'catalog'` to `validJobTypes` array
- Add catalog-specific credit cost: `4` per image (flat, no model/scene premium)

**2. `process-queue/index.ts`**
- Already has `catalog: "generate-catalog"` mapping — no change needed

**3. `generate-catalog/index.ts`**
- Accept `prompt_final` field; use it when present instead of `buildCatalogPrompt()`
- Make `model` fields optional for product-only mode
- When no model image, send only product image as reference
- Add retry logic: if Seedream fails with a transient error, retry once after 3s

**4. `useCatalogGenerate.ts`**
- Change `jobType: 'tryon'` → `jobType: 'catalog'`
- Wrap `convertImageToBase64` in try/catch per product
- Add 10-minute polling hard timeout
- On insufficient credits error from any job, stop enqueueing remaining jobs immediately (fail-fast)

## Files Modified

| File | Changes |
|------|---------|
| `supabase/functions/enqueue-generation/index.ts` | Add `catalog` to valid types, 4-credit pricing |
| `supabase/functions/generate-catalog/index.ts` | Use `prompt_final`, optional model, retry logic |
| `src/hooks/useCatalogGenerate.ts` | Fix jobType, add polling timeout, base64 error handling, fail-fast on credit errors |

