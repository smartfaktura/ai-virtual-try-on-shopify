

## Fix: Prevent Single-Job Error Callback from Killing Multi-Product Batches

### Problem
During multi-product workflow generation (Product Listing Set with multiple products/models/scenes), the `useGenerationQueue` hook's `onGenerationFailed` callback fires for individual job failures. This callback unconditionally:
1. Shows a toast error ("Generation failed...")
2. Resets `currentStep` to `'settings'` — destroying the progress UI
3. Calls `resetQueue()` — clearing state

Meanwhile, the multi-product polling loop (line 1815) is designed to handle individual failures gracefully — it counts them, continues polling, and shows a summary at the end.

The single-job completion watcher (line 1752) already has a guard: `if (multiProductJobIds.size > 0) return;`. But the `onGenerationFailed` callback at line 186 has **no such guard**, so any single job failure during a batch causes the entire UI to reset.

### Fix

**In `Generate.tsx`, guard the `onGenerationFailed` callback to skip when multi-product polling is active.**

At line 186, wrap the callback body so it only fires when `multiProductJobIds.size === 0`:

```tsx
onGenerationFailed: (_jobId, _message, errorType) => {
  // Multi-product batches handle failures in their own polling loop
  if (multiProductJobIdsRef.current.size > 0) return;
  
  const friendlyMessages = { ... };
  toast.error(...);
  setCurrentStep('settings');
  refreshBalance();
  resetQueue();
},
```

Since `onGenerationFailed` is passed as a stable option to the hook, we need a ref to track the current `multiProductJobIds` size (to avoid re-creating the callback and re-mounting the hook):

```tsx
const multiProductJobIdsRef = useRef(multiProductJobIds);
useEffect(() => { multiProductJobIdsRef.current = multiProductJobIds; }, [multiProductJobIds]);
```

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Add `multiProductJobIdsRef` ref; guard `onGenerationFailed` to skip during active batches |

### Impact
- Individual job failures during batch generation no longer reset the entire UI
- The multi-product polling loop continues to aggregate results and shows a summary at the end
- Single-product generation error handling remains unchanged

