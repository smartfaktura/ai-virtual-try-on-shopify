

# Catalog Studio Debug Report — Findings & Fixes

## Current State: What Works
- **Queue routing**: `process-queue` correctly maps `catalog` → `generate-catalog` (line 17)
- **Credit pricing**: `enqueue-generation` charges 4 credits for catalog jobs (correct)
- **Prompt flow**: `generate-catalog` correctly uses `prompt_final` when present (line 336)
- **Product-only mode**: `generate-catalog` accepts missing `model` field (line 294 validates only `product.imageUrl`)
- **Retry logic**: Seedream transient errors (429/502/503) retry once with 3s delay
- **Completion flow**: `completeQueueJob` properly handles refunds, inserts into `generation_jobs`, and sends failure emails
- **Polling**: 10-minute hard timeout, 401 session refresh, per-product progress tracking

## Bugs Found

### Bug 1: `product_image_url` stored as base64 blob in `generation_jobs`
**Severity: Medium** — `payload.product.imageUrl` at line 277 of `generate-catalog` is the base64 string sent from the client. This gets stored in the `product_image_url` column, bloating the database with massive base64 strings instead of a clean URL.

**Fix**: After uploading the generated image to storage, also resolve the original product URL from the non-base64 source. Add `product_image_url` to the payload from the client side as the original URL (not base64).

### Bug 2: `workflow_slug` hardcoded to `"catalog-shot-set"` (outdated)
**Severity: Low** — Line 275 still says `"catalog-shot-set"` but the feature was renamed to "Catalog Studio". This affects library filtering and analytics.

**Fix**: Change to `"catalog-studio"`.

### Bug 3: Completion screen "View in Library" uses `window.location.href` instead of React Router
**Severity: Low** — Line 304 does a full page reload (`window.location.href = '/app/library'`). Should use React Router navigation.

**Fix**: Use `useNavigate()` from react-router-dom.

### Bug 4: Result images may contain expired Seedream URLs as fallback
**Severity: Medium** — If the storage upload fails (lines 396-401), the system falls back to the raw Seedream URL which expires after a few hours. The completion page would show broken images.

**Fix**: Already handled with retry, but add a warning toast on the completion screen if an image URL doesn't match the expected storage domain.

### Bug 5: Timer effect has dependency issue
**Severity: Low** — Line 95: `useEffect` depends on `batchState` (the whole object), causing the interval to be torn down and recreated on every poll update (every 3 seconds). This resets the timer each cycle.

**Fix**: Extract `batchState?.allDone` as the only dependency, and use a ref for `generationStartedAt`.

### Bug 6: No `product_id` passed in catalog payload
**Severity: Medium** — In `useCatalogGenerate.ts`, the enqueue payload doesn't include `product_id`. So `generate-catalog` line 266 (`payload.product_id`) is always null, meaning catalog images won't be linked to products in the library.

**Fix**: Add `product_id: productId` to the payload in `enqueueJob`.

## Plan

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useCatalogGenerate.ts` | Add `product_id` and `product_image_url` (original URL) to enqueue payload |
| `supabase/functions/generate-catalog/index.ts` | Fix `workflow_slug` to `"catalog-studio"`, use `product_image_url` from payload instead of base64 |
| `src/pages/CatalogGenerate.tsx` | Fix timer effect dependencies, replace `window.location.href` with `useNavigate()` |

### Detailed Changes

**1. `useCatalogGenerate.ts` — Add product metadata to payload**
- In `enqueueJob`, add to the payload object:
  - `product_id: productId`
  - `product_image_url: <original URL>` — pass the original product image URL (not base64) as a separate field
- This requires passing the original URL alongside the base64 version through the pipeline

**2. `generate-catalog/index.ts` — Fix stored metadata**
- Line 275: Change `workflow_slug: "catalog-shot-set"` → `"catalog-studio"`
- Line 277: Use `payload.product_image_url` (the clean URL) instead of `(payload.product as Record<string, unknown>)?.imageUrl` (which is base64)

**3. `CatalogGenerate.tsx` — Fix timer and navigation**
- Extract `batchState?.allDone` into a variable and use only that + `generationStartedAt` as effect dependencies
- Use `generationStartedAtRef` to avoid re-running the effect
- Replace `window.location.href = '/app/library'` with `navigate('/app/library')` using `useNavigate()`

