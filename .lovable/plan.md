

# Fix: Multi-Product Generation Gets Stuck on "Generating" Step

## Problem
The generation backend works fine (~2.5 min for 10 images). The UI issue is that with multiple products, the wizard never transitions from "Generating" to "Results" because:
- Auto-transition only fires for `products.length === 1` (line 434)
- `completedJobs` Map is never populated — no code tracks completed jobs
- `useGenerationQueue` only tracks a single `activeJob` — the second job's results are invisible
- No manual "View Results" fallback button for multi-product

## Fix — `src/pages/TextToProduct.tsx`

### 1. Track all job IDs and poll them independently
After enqueuing, store all job IDs. Add a polling effect that queries all enqueued jobs from `generation_queue` and populates `completedJobs` as each finishes.

### 2. Add a polling effect for multi-product
```typescript
useEffect(() => {
  if (step !== 'generating' || jobProductMap.size <= 1) return;
  const jobIds = Array.from(jobProductMap.keys());
  const interval = setInterval(async () => {
    const { data } = await supabase
      .from('generation_queue')
      .select('id, status, result')
      .in('id', jobIds);
    // Update completedJobs for each completed job
    // When all done → setStep('results')
  }, 3000);
  return () => clearInterval(interval);
}, [step, jobProductMap]);
```

### 3. Fix auto-transition for multi-product
When all jobs in `jobProductMap` are completed (tracked via the polling effect), auto-transition to results.

### 4. Add aggregate progress display
Show `X / Y products completed` plus individual progress per product.

### 5. Add "View Results" fallback button
Show a button to view partial results when at least one product is done, similar to the Product Images flow.

## Files Changed
| File | Change |
|------|--------|
| `src/pages/TextToProduct.tsx` | Add multi-job polling, fix transition, improve generating UI |

No backend or edge function changes needed.

