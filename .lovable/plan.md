

## Fix: Perspectives grouping merges separate batches

### Problem
In `src/pages/Workflows.tsx` (lines 200–222), Picture Perspectives results from `freestyle_generations` are grouped by a **10-minute time window**. If you generate two separate Perspectives batches within 10 minutes (e.g., hoodie + crop top), all their images get merged into one preview card showing 10 mixed images instead of two separate cards of 5 each.

### Root Cause
The grouping only checks `Math.abs(rowTime - groupTime) <= 10 * 60 * 1000` but doesn't differentiate by product or batch. The `freestyle_generations` table stores a `workflow_label` like `"Picture Perspectives — Close-up Detail"` which contains the variation name but not a batch identifier.

### Solution
Use the `batch_id` field that is already stored on the `generation_queue` jobs. The `freestyle_generations` table likely doesn't have a `batch_id`, but the `workflow_label` contains the product context. We should group by **workflow_label prefix** (the part before the " — " variation suffix) AND the time window, so two different products within 10 minutes stay separate.

**Better approach**: The `workflow_label` format is `"Picture Perspectives — [Variation]"` — all variations from the same batch share the same product but we can't distinguish products from labels alone. Instead, reduce the time window from **10 minutes to 30 seconds** (matching the typical enqueue duration of a batch with 500ms stagger × ~5–10 images = 2.5–5s). This is a simple, reliable fix.

### Changes

**`src/pages/Workflows.tsx`** — In the Perspectives grouping loop (~line 211):
- Change the time window from `10 * 60 * 1000` (10 min) to `30 * 1000` (30 seconds)
- This ensures only images enqueued in the same rapid burst get grouped together, while separate batches (even a minute apart) remain distinct cards

| File | Change |
|------|--------|
| `src/pages/Workflows.tsx` | Reduce Perspectives grouping window from 10 min to 30 seconds |

