
## Goal
QA credit deduction and calculation correctness across all workflows on `/app/workflows`. This is a research/audit task — I'll inspect the code paths, DB functions, and run targeted DB queries to verify users are charged correctly.

## Approach
Read-only audit covering:

1. **Workflow inventory** — list all generation entry points reachable from `/app/workflows` (Product Images, Catalog Studio, Freestyle, Brand Models, Try-On, Upscale, Video flows: Animate / Ad Sequence / Consistent Model / Short Film, Creative Drops).
2. **Cost calculation layer (frontend)** — verify each workflow uses the correct pricing source:
   - `videoCreditPricing.ts` (video)
   - `dropCreditCalculator.ts` (drops)
   - inline per-image (6 credits) for image flows
   - upscale (10/15) for 2K/4K
3. **Enqueue layer** — confirm `enqueueWithRetry` sends `imageCount × cost` matching frontend display, and that `enqueue-generation` edge function recomputes server-side (defense in depth) rather than trusting client.
4. **DB-side reservation** — `enqueue_generation` RPC: reserves credits atomically, locks profile row, checks balance, decrements `credits_balance`.
5. **Refund paths**:
   - `cancel_queue_job` + `handle_queue_cancellation` trigger → `refund_credits`
   - `cleanup_stale_jobs` → partial refund on timeout, full refund on retry exhaustion
   - Failure path in queue processor
6. **Live data spot-check** — query recent `generation_queue` rows: compare `credits_reserved` vs job_type/payload to catch mismatches; check for orphaned `processing` jobs; verify completed jobs match expected pricing formula.
7. **Edge cases**:
   - Bulk batches (per-image pacing, partial completion refunds)
   - Multi-product matrix (products × scenes × models)
   - Video premium add-ons (ambient audio, premium motion, voice)
   - First-generation priority discount (does not affect cost, only priority)

## Deliverable
A concise audit report with:
- ✅ Workflows charging correctly
- ⚠️ Discrepancies or risks found (frontend vs server vs DB)
- 🔧 Recommended fixes (if any)

No code changes in this pass — only diagnosis. Any fixes will be proposed as a follow-up plan after you review findings.

## Out of scope
- Stripe top-up / subscription renewal flows (separate billing system)
- UI copy for credit display
- Implementing fixes (this round is audit only)
