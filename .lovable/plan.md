

## Fix: Unified Activity Card for Multi-Product Batch Generations

### Problem

When a user runs "Virtual Try-On Set" with 16 products × 5 combos = 80 images, the Workflows Activity section shows **16 separate cards** (one per product). This is because:

1. The multi-product try-on enqueue loop (`Generate.tsx` line 1556) does **not set a `batch_id`** in the payload
2. The grouping logic in `batchGrouping.ts` falls back to time-window grouping which groups by `workflow_id + product_name` — different products = different groups
3. Same issue in the multi-product workflow path (line 1126) and multi-combo workflow path (line 1380)

The user wants to see **one card**: "Virtual Try-On Set — 12 of 80 images done" with a single progress bar.

### Plan

#### 1. Generate a shared `batch_id` before each multi-job loop

In `Generate.tsx`, before each multi-product/multi-combo loop, generate a UUID `batchId` and include it in every enqueue payload. This affects 3 loops:

- **Multi-product try-on** (line 1552): Add `const batchId = crypto.randomUUID()` and pass `batch_id: batchId` in each `enqueueTryOnForProduct` call
- **Multi-product workflow** (line 1126): Same pattern
- **Multi-combo workflow** (line 1380): Same pattern

#### 2. Update `enqueueTryOnForProduct` to accept and forward `batch_id`

Add an optional `batchId` parameter to the function signature (line 1438). Include it in the enqueue payload so the queue job has it stored.

#### 3. Also refactor `enqueueTryOnForProduct` to use shared helper

Replace the 60-line inline retry logic with `enqueueWithRetry` from `enqueueGeneration.ts`. This also fixes the remaining inconsistency where this function still uses raw `fetch` instead of the unified helper.

#### 4. Update `injectActiveJob` calls to include `batch_id`

The optimistic job injection at line 1571 needs to pass `batch_id: batchId` so the UI immediately groups jobs correctly before the server data arrives.

#### 5. Update `optimisticJobInjection.ts` to support `batch_id`

Ensure the `injectActiveJob` params accept and forward `batch_id`.

#### 6. Update `WorkflowActivityCard` to show product breakdown for large batches

For batch groups with multiple products, show a summary header ("Virtual Try-On Set — 12/80 images") with a small expandable list of per-product progress underneath (optional, collapsed by default).

### What this achieves

- All 80 jobs from one generation session share the same `batch_id`
- `batchGrouping.ts` already groups by `batch_id` first (line 71-113) — no changes needed there
- Activity section shows **one card** with aggregate progress instead of 16 separate cards
- The card title drops the product name and shows the workflow name + total progress

### Files changed

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Generate `batch_id` before loops; pass to enqueue calls + optimistic injection; refactor `enqueueTryOnForProduct` to use shared helper |
| `src/lib/optimisticJobInjection.ts` | Forward `batch_id` field |
| `src/components/app/WorkflowActivityCard.tsx` | For multi-product batches, show aggregate title + optional per-product breakdown |

### Timing impact

None — no new delays. The `batch_id` is just a UUID string added to the existing payload.

