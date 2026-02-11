

## Phase 4 Audit: Frontend Queue Integration

### Status: Mostly Wired -- 2 Issues Found

---

### What's Working

Both primary pages (Generate.tsx and Freestyle.tsx) correctly route all generation through `useGenerationQueue.enqueue()`:

| Page | Job Types | Status |
|------|-----------|--------|
| Generate.tsx | `product`, `workflow`, `tryon` | All use `enqueue()` |
| Freestyle.tsx | `freestyle` | Uses `enqueue()` |

Both pages handle queue job completion via `useEffect` watching `activeJob.status`, correctly transitioning to results or handling failures with credit refresh.

The `QueuePositionIndicator` component correctly renders all states: queued, processing, completed, failed, cancelled.

---

### Issue 1: Dead Hook Imports in Generate.tsx (Cleanup)

Generate.tsx still imports and destructures the old direct-call hooks on lines 165-167:

```typescript
const { generate: generateTryOn, isLoading: isTryOnGenerating, progress: tryOnProgress } = useGenerateTryOn();
const { generate: generateProduct, isLoading: isProductGenerating, progress: productProgress } = useGenerateProduct();
const { generate: generateWorkflow, isLoading: isWorkflowGenerating, progress: workflowProgress } = useGenerateWorkflow();
```

**`generateTryOn`, `generateProduct`, `generateWorkflow` are never called** -- all three generation paths now use `enqueue()`. However, the destructured variables `isTryOnGenerating`, `tryOnProgress`, `isProductGenerating`, `productProgress`, `isWorkflowGenerating`, `workflowProgress` are still referenced:

- **Progress bar** (line 1474-1477): Uses `tryOnProgress`, `workflowProgress`, `productProgress` -- but these will always be `0` since the hooks are never triggered. The progress bar on the "generating" step is effectively dead.
- **TryOnConfirmModal** (line 1602): Uses `isTryOnGenerating` for `isLoading` prop -- but this will always be `false`.

**Fix**: Remove the three hook imports entirely. Replace the progress bar with queue-based progress (use `isQueueProcessing` and a simple indeterminate/pulse state, or show the `QueuePositionIndicator` on the generating step). Replace `isTryOnGenerating` in TryOnConfirmModal with `isEnqueuing` from the queue hook (currently not destructured but available).

---

### Issue 2: Bulk Generation Bypasses Queue (Known Limitation)

`useBulkGeneration.ts` (line 202) calls `generate-tryon` directly with the anon key, not through `enqueue-generation`. This means:

- No credit deduction via the queue system
- No concurrency limits enforced
- No queue priority
- Auth will fail since it uses the anon key (no user JWT, and no `x-queue-internal` header)

This is a known architectural gap. Bulk generation has its own retry/pause/resume logic that doesn't fit the single-job queue model. However, the direct call to `generate-tryon` with `SUPABASE_ANON_KEY` will likely fail now that `generate-tryon` requires auth.

**Recommendation**: This is a separate Phase 5+ task. For now, document it as a known limitation.

---

### Recommended Changes

1. **Remove dead hook imports** from Generate.tsx (`useGenerateTryOn`, `useGenerateProduct`, `useGenerateWorkflow`) and all their destructured variables
2. **Fix the generating step progress bar** to use queue state instead of the dead hook progress values (show `QueuePositionIndicator` or an indeterminate progress)
3. **Fix TryOnConfirmModal loading prop** to use queue's `isEnqueuing` state
4. **Add `isEnqueuing` to the destructured queue hook** in Generate.tsx (currently only `enqueue`, `activeJob`, `isProcessing`, `reset` are destructured)

### Files to Change

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Remove 3 dead hook imports; fix progress bar; fix modal loading prop; add `isEnqueuing` destructuring |

### Not in Scope (Phase 5+)

| Item | Reason |
|------|--------|
| `useBulkGeneration.ts` direct API calls | Different architecture (batch queue with pause/resume); needs its own queue integration design |
| `useGenerateFreestyle.ts` unused import in Freestyle.tsx | The `generate` function and `isLoading`/`progress` from this hook are still referenced in `panelProps` (lines 53, 332-333), but `generate` is never called since `handleGenerate` uses `enqueue()`. These props flow to `FreestylePromptPanel` which may use them for UI state. Needs deeper trace before removing. |

