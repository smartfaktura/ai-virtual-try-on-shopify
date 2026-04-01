

# Fix: Catalog Pipeline → generate-tryon Compatibility

## Problem
The new catalog pipeline sends jobs with `job_type: 'tryon'` but uses a catalog-specific payload (has `catalog_mode: true`, `render_path`, `shot_id`, `prompt_final` — but **no `pose` field**). The `generate-tryon` edge function validates for `product + model + pose` and rejects catalog jobs immediately.

## Solution
Add a **catalog mode bypass** at the top of `generate-tryon/index.ts`. When the payload contains `catalog_mode: true`, skip the standard validation and use the pre-assembled `prompt_final` directly instead of calling `buildPrompt()`.

### Changes to `supabase/functions/generate-tryon/index.ts`

**After the `userId` check (line 733), before the existing validation (line 735):**

1. Detect `catalog_mode: true` in the body
2. If catalog mode:
   - Use `body.prompt_final` as the prompt (already assembled by the client-side catalog engine)
   - Extract product image from `body.product.imageUrl`
   - Extract model image from `body.model?.imageUrl` (optional for product-only shots)
   - Extract `anchor_image_url` if present (for reference-generate / anchor-edit paths)
   - Skip the `pose` validation entirely
   - Skip `buildPrompt()` — use the pre-assembled prompt
   - Fall through to the same image generation loop (Gemini → Seedream → Flash fallback chain)
3. If not catalog mode: existing validation and flow unchanged

**Roughly 30 lines of new code** inserted as an early-return branch, no changes to the existing tryon flow.

### No other file changes needed
- `useCatalogGenerate.ts` already sends the correct payload shape
- `catalogEngine.ts` already assembles prompts correctly
- `process-queue` already routes `tryon` jobs to `generate-tryon`

## Stuck Job
The current stuck job (`9ae827c9`) will be auto-cleaned by `cleanup_stale_jobs` after its second timeout (retry_count=1 means next cleanup marks it failed + refunds credits). No manual intervention needed.

