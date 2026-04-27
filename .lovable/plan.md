# Fix: wire `first_generation_started` + `first_generation_completed` into Product Visuals

## Root cause (confirmed)

`/app/generate/product-images` is rendered by `src/pages/ProductImages.tsx`, which has its **own** enqueue loop (`enqueueWithRetry` directly at line 956) and its **own** completion handler (`finishWithResults` at line 1014). It bypasses both `useGenerationBatch` and `useGenerationQueue` — the only places the GTM events were wired. That's why nothing fires for this flow even though tracking is deployed and unconditional.

`src/pages/Generate.tsx` (legacy multi-flow page, 4787 lines) has the same shape at 4 direct enqueue sites.

`src/lib/gtm.ts` itself is correct: `dataLayer.push` is unconditional, dedup uses localStorage with safe in-memory fallback. Only the bug was missing call sites.

## Changes

### 1. `src/lib/gtm.ts` — add safe debug helpers

Add (next to existing `DEBUG`):

```ts
/** Runtime GTM debug toggle: localStorage.setItem('vovv_gtm_debug','1') */
export function isGtmDebugEnabled(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('vovv_gtm_debug') === '1';
  } catch { return false; }
}

/** Safe localStorage.getItem — never throws. */
export function safeLocalGet(key: string): string | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  } catch { return null; }
}
```

`page_location` is already added inside `gtmFirstGenerationStarted` and needs to be added inside `gtmFirstGenerationCompleted` (currently missing). Patch:

```ts
// gtmFirstGenerationCompleted payload — add page_location
result_count: resultCount,
page_location: typeof window !== 'undefined' ? window.location.href : '',
```

This guarantees every `started`/`completed` payload has `user_id`, `product_id` (or omitted when null), `generation_id`, `visual_type`, and `page_location`.

### 2. `src/pages/ProductImages.tsx` — wire both events

**Imports** (line 12 area):
```ts
import { gtmFirstGenerationStarted, gtmFirstGenerationCompleted, isGtmDebugEnabled, safeLocalGet } from '@/lib/gtm';
```

**Carry the actual product_id on each job descriptor** (line 809–815 + line 939):

```ts
interface JobDescriptor {
  key: string;
  payload: Record<string, unknown>;
  productTitle: string;
  productId: string;     // NEW
  hasModel: boolean;
  batchId: string;
}
// ...
allJobs.push({ key, payload, productTitle: product.title, productId: product.id, hasModel: !!currentModelRef, batchId });
```

**`first_generation_started`** — fire on FIRST successful enqueue inside the chunk loop (line 963–983 area):

```ts
for (const settled of results) {
  if (settled.status !== 'fulfilled') continue;
  const { key, result, productTitle, productId, batchId: bid } = settled.value;
  if (!isEnqueueError(result) && result.jobId && user?.id) {
    const wasFirst = newJobMap.size === 0;          // before insert
    newJobMap.set(key, result.jobId);
    lastBalance = result.newBalance;

    if (wasFirst) {
      const payload = settled.value.payload as Record<string, unknown> | undefined;
      const resolvedProductId =
        (payload?.product_id as string | undefined) ??
        productId ??
        selectedProducts[0]?.id ??
        null;
      const visualType =
        (payload?.workflow_slug as string | undefined) ||
        (payload?.workflow_name as string | undefined) ||
        'product-images';

      if (isGtmDebugEnabled()) {
        // eslint-disable-next-line no-console
        console.log('[GTM DEBUG first_generation_started]', {
          flow: 'product-images',
          hasUser: !!user, userId: user.id,
          jobId: result.jobId, isError: false,
          productId: resolvedProductId,
          visualType,
          dedupKey: `gtm:firstgen-started:${user.id}`,
          dedupExists: safeLocalGet(`gtm:firstgen-started:${user.id}`),
          willFire: true,
        });
      }
      gtmFirstGenerationStarted({
        userId: user.id,
        productId: resolvedProductId,
        generationId: result.jobId,
        visualType,
      });
    }

    injectActiveJob(/* unchanged */);
  } else if (!isEnqueueError(result)) {
    // (unchanged path)
  } else if (result.type === 'insufficient_credits') {
    toast.error(result.message);
    aborted = true;
  }
}
```

(Note: `payload` is on the `JobDescriptor` already — `settled.value.payload` is valid because `.then(result => ({ ...job, result }))` spreads job fields including `payload`.)

**`first_generation_completed`** — fire inside `finishWithResults` (line 1014–1038), after `setResults`, only when there is a real backend job ID and ≥1 image:

```ts
const totalResultImages = Array.from(resultMap.values())
  .reduce((n, r) => n + r.images.length, 0);

const firstCompleted = jobs.find(j => j.status === 'completed' && j.id);
const firstCompletedMeta = firstCompleted ? productMap.get(firstCompleted.id) : undefined;
const completedProductId = firstCompletedMeta?.productId && firstCompletedMeta.productId !== 'unknown'
  ? firstCompletedMeta.productId
  : (selectedProducts[0]?.id ?? null);

if (isGtmDebugEnabled()) {
  // eslint-disable-next-line no-console
  console.log('[GTM DEBUG first_generation_completed]', {
    flow: 'product-images',
    hasUser: !!user, userId: user?.id,
    generationId: firstCompleted?.id ?? null,
    resultCount: totalResultImages,
    hasImages: totalResultImages > 0,
    dedupKey: user?.id ? `gtm:firstgen-completed:${user.id}` : null,
    dedupExists: user?.id ? safeLocalGet(`gtm:firstgen-completed:${user.id}`) : null,
    willFire: !!(user?.id && firstCompleted?.id && totalResultImages > 0),
  });
}

if (user?.id && firstCompleted?.id && totalResultImages > 0) {
  gtmFirstGenerationCompleted({
    userId: user.id,
    productId: completedProductId,
    generationId: firstCompleted.id,
    visualType: 'product-images',
    resultCount: totalResultImages,
  });
}
```

`firstCompleted.id` is the row id from `generation_queue` (selected on lines 1063, 1080) — i.e. the real backend job ID, not a UI ID.

Add `user` to the deps of `handleGenerate`'s `useCallback` and `finishWithResults`'s `useCallback`.

### 3. `src/pages/Generate.tsx` — wire `first_generation_started` at all 4 enqueue sites

This file has 4 distinct multi-product/multi-variation loops (lines 1247, 1406, 1618, 1667). Use a **component-level `useRef<boolean>(false)`** (NOT a module-level variable) so cross-render guarding is safe and per-mount; the gtm helper still dedupes per `user.id` across sessions.

Near other refs in the component (around line 290):
```ts
const firstgenStartedFiredRef = useRef(false);
```

Add this helper inside the component (just below the ref):
```ts
const fireFirstgenStartedOnce = useCallback((opts: {
  jobId: string;
  productId: string | null;
  visualType: string;
}) => {
  if (firstgenStartedFiredRef.current) return;
  if (!user?.id || !opts.jobId) return;
  if (isGtmDebugEnabled()) {
    // eslint-disable-next-line no-console
    console.log('[GTM DEBUG first_generation_started]', {
      flow: 'generate', hasUser: true, userId: user.id,
      jobId: opts.jobId, productId: opts.productId, visualType: opts.visualType,
      dedupKey: `gtm:firstgen-started:${user.id}`,
      dedupExists: safeLocalGet(`gtm:firstgen-started:${user.id}`),
      willFire: true,
    });
  }
  gtmFirstGenerationStarted({
    userId: user.id,
    productId: opts.productId,
    generationId: opts.jobId,
    visualType: opts.visualType,
  });
  firstgenStartedFiredRef.current = true; // set ONLY after success + fire
}, [user]);
```

At each of the 4 enqueue sites, immediately after the existing `if (!isEnqueueError(result))` block sets `jobMap.set(...)`, add:

```ts
fireFirstgenStartedOnce({
  jobId: result.jobId,
  productId: (payload as any)?.product_id ?? product?.id ?? null,
  visualType: (payload as any)?.workflow_slug
    || (payload as any)?.workflow_name
    || /* literal flow tag: 'upscale' | 'workflow' | 'tryon' */ 'workflow',
});
```

Site-by-site `visualType` fallback: 1247 → `'upscale'`, 1406/1618 → use payload `workflow_slug`, 1667 → `'tryon'`.

`first_generation_completed` for `Generate.tsx` is intentionally **out of scope** for this change because completion polling is wired through `useGenerationQueue` for some paths and a custom multi-product polling for others — wiring it safely needs a separate audit. The user-reported blocker is Product Visuals; that flow gets BOTH events.

### 4. Optional debug-flag log in already-wired hooks

Add the same `isGtmDebugEnabled()` log alongside the existing `import.meta.env.DEV` `console.debug` in:
- `useGenerationBatch.ts` (started + completed)
- `useGenerationQueue.ts` (started)
- `useUpscaleImages.ts`, `useCatalogGenerate.ts`, `useGeneratePerspectives.ts`, `useBulkVideoProject.ts`, `useShortFilmProject.ts`

These already fire the events correctly — this just makes prod debugging consistent.

## Safety checklist applied

1. ✅ Started fires only when `!isEnqueueError(result) && result.jobId && user?.id`.
2. ✅ `productId` resolved from payload first, then job descriptor, then `selectedProducts[0]?.id`, finally `null`.
3. ✅ Completed fires only when `totalResultImages > 0 && firstCompleted?.id && user?.id`.
4. ✅ `firstCompleted.id` is from the `generation_queue` DB row — the real backend job ID.
5. ✅ Generate.tsx uses `useRef(false)`, not a module-level guard.
6. ✅ `firstgenStartedFiredRef.current = true` set only AFTER successful fire.
7. ✅ Both events include user_id, product_id (or null), generation_id, visual_type, page_location.
8. ✅ `page_location` added to `gtmFirstGenerationCompleted` inside `gtm.ts` — every callsite gets it for free.
9. ✅ `dataLayer.push` remains unconditional. Only `console.log` debug lines are gated.
10. ✅ All `localStorage` reads use `safeLocalGet`/`isGtmDebugEnabled` (try/catch).
11. ✅ Debug flag prints `[GTM DEBUG first_generation_started]` and `[GTM DEBUG first_generation_completed]`.
12. ✅ No GTM container changes; Tags Fired = None expected.

## How to verify after deploy

```js
// 1. Enable debug
localStorage.setItem('vovv_gtm_debug','1');
// 2. Clear dedup so events can re-fire for this account
Object.keys(localStorage).filter(k => k.startsWith('gtm:firstgen')).forEach(k => localStorage.removeItem(k));
// 3. Run a generation on /app/generate/product-images
// 4. Watch console — expect [GTM DEBUG first_generation_started], then [GTM] first_generation_started.
//    After results land: [GTM DEBUG first_generation_completed], then [GTM] first_generation_completed.
// 5. Confirm:
window.dataLayer.filter(x => x.event?.startsWith('first_generation_'))
```

## Files changed

- `src/lib/gtm.ts` — helpers + add `page_location` to completed payload
- `src/pages/ProductImages.tsx` — started + completed wired
- `src/pages/Generate.tsx` — started wired at 4 enqueue sites (component-level ref)
- `src/hooks/useGenerationBatch.ts`, `useGenerationQueue.ts`, `useUpscaleImages.ts`, `useCatalogGenerate.ts`, `useGeneratePerspectives.ts`, `useBulkVideoProject.ts`, `useShortFilmProject.ts` — add `vovv_gtm_debug` console.log alongside existing DEV `console.debug`
