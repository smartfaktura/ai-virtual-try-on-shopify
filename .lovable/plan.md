

## Fix: Preserve Freestyle Settings After Generation Completes

### Root Cause

The completion handler `useEffect` in `Freestyle.tsx` (line 386-412) has an oversized dependency array that includes reactive state values like `prompt`, `aspectRatio`, `quality`, `selectedModel`, `selectedScene`, `selectedProduct`, and callback references like `saveImages` and `refreshBalance`. When the generation completes and `refreshImages()` / `refreshBalance()` are called, these trigger re-renders that can cause the effect to re-fire with stale closure references. Combined with auth token refreshes that happen during long-running generations (changing the `user` reference, which cascades to new `saveImages`/`refreshBalance` references), this creates a cycle that can remount the component or flash the loading state, effectively resetting all form inputs.

### Fix

**File: `src/pages/Freestyle.tsx`**

1. Move the completion logic into a stable ref-based pattern so it does not depend on form state values (prompt, model, scene, etc.). These values are not needed in the effect body for the success path -- they were only there because `saveImages` used them, but images are now saved server-side by `process-queue`.

2. Replace the large dependency array with only the values actually needed: `activeJob` status changes, and stable function refs via `useRef`.

3. Store `refreshImages`, `refreshBalance`, and `resetQueue` in refs so the effect only depends on `activeJob`.

**File: `src/contexts/CreditContext.tsx`**

4. Remove the `setIsLoading(true)` call inside `fetchCredits` (used by `refreshBalance`). Setting loading to true during a background refresh is unnecessary and causes the entire credit-dependent tree to re-render. The balance should update in-place without a loading flash.

### Technical Detail

Current problematic effect (Freestyle.tsx lines 386-412):
```typescript
// BEFORE: 10+ dependencies, many unnecessary
useEffect(() => {
  if (!activeJob) return;
  // ...completion logic...
}, [activeJob, prompt, aspectRatio, quality, selectedModel, 
    selectedScene, selectedProduct, saveImages, refreshBalance, resetQueue]);
```

Fixed version using refs for stable callbacks:
```typescript
// Store callbacks in refs so effect only depends on activeJob
const refreshImagesRef = useRef(refreshImages);
const refreshBalanceRef = useRef(refreshBalance);
const resetQueueRef = useRef(resetQueue);
const promptRef = useRef(prompt);

// Keep refs current
useEffect(() => { refreshImagesRef.current = refreshImages; }, [refreshImages]);
useEffect(() => { refreshBalanceRef.current = refreshBalance; }, [refreshBalance]);
useEffect(() => { resetQueueRef.current = resetQueue; }, [resetQueue]);
useEffect(() => { promptRef.current = prompt; }, [prompt]);

useEffect(() => {
  if (!activeJob) return;
  const prevStatus = prevJobStatusRef.current;
  prevJobStatusRef.current = activeJob.status;

  if (activeJob.status === 'completed' && prevStatus !== 'completed') {
    const result = activeJob.result as { ... } | null;
    if (result?.contentBlocked) {
      setBlockedEntries(prev => [{ ... }, ...prev]);
      resetQueueRef.current();
    } else {
      refreshImagesRef.current();
      refreshBalanceRef.current();
      resetQueueRef.current();
    }
  }

  if (activeJob.status === 'failed' && prevStatus !== 'failed') {
    refreshBalanceRef.current();
    resetQueueRef.current();
  }
}, [activeJob]); // Only depends on activeJob now
```

CreditContext fix:
```typescript
// BEFORE:
const fetchCredits = useCallback(async () => {
  // ...
  setIsLoading(true);  // <-- causes re-render flash, remove this
  // ...fetch...
  setIsLoading(false);
}, [user]);

// AFTER:
const fetchCredits = useCallback(async () => {
  if (!user) { ... return; }
  // No setIsLoading(true) — silent background refresh
  const { data, error } = await supabase...
  if (!error && data) {
    setBalance(data.credits_balance);
    setPlan(data.plan || 'free');
  }
}, [user]);
```

These two changes ensure:
- The completion effect fires exactly once when status transitions to completed/failed
- No cascading re-renders from callback reference changes
- No loading flash from credit refresh
- All form state (prompt, model, scene, aspect ratio, etc.) is completely untouched

