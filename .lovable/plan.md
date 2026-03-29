

# Fix Mobile Workflow Generation UI Freezing

## Problem
On mobile, when generating via workflows, the elapsed timer stops counting, progress animations freeze, and the rotating team messages don't cycle. The UI appears stuck on "Generating..." with no movement.

**Root cause**: Mobile browsers aggressively throttle or pause `setInterval`/`setTimeout` when tabs are backgrounded, the screen locks, or even during scroll inertia. The `WorkflowActivityCard` and its child `ActiveGroupCard` rely entirely on intervals for:
1. Elapsed time ticking (parent's `tick` state, every 1s)
2. Team message rotation (`msgIdx` state, every 3s)

When these intervals pause, no state updates fire, no re-renders happen, and the UI freezes — even though `elapsedLabel()` uses `Date.now()` correctly, it never gets called.

## Fix

### 1. Add a visibility-aware tick hook
**New file: `src/hooks/useVisibilityTick.ts`**

Create a reusable hook that:
- Runs a `setInterval` for regular ticking
- Listens for `document.visibilitychange` events
- When the page becomes visible again, immediately forces a tick (state update) so all computed values refresh instantly
- Returns a tick counter that components can depend on

```text
// Pseudo-logic
function useVisibilityTick(intervalMs: number, enabled: boolean): number {
  const [tick, setTick] = useState(0);
  
  useEffect(() => {
    if (!enabled) return;
    const bump = () => setTick(t => t + 1);
    const interval = setInterval(bump, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === 'visible') bump();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, [intervalMs, enabled]);
  
  return tick;
}
```

### 2. Update `WorkflowActivityCard.tsx`
- Replace the manual `setInterval` tick (lines 192-200) with `useVisibilityTick(1000, hasActiveGroups)`
- Replace `ActiveGroupCard`'s team rotation interval (lines 74-79) with `useVisibilityTick(3000, isProcessing)` and derive `msgIdx` from tick value

### 3. Update `GlobalGenerationBar.tsx`
- Replace elapsed tick interval (lines 159-163) and quote rotation interval (lines 166-170) with the same `useVisibilityTick` hook
- This fixes the same freeze issue on the global bar (currently desktop-only with `hidden sm:block`, but future-proofs it)

### 4. Update `QueuePositionIndicator.tsx`
- Replace the `ProcessingState` elapsed timer (line 72-79) and team rotation interval (lines 82-86) with the visibility-aware hook for consistency

## Summary of changes
| File | Change |
|---|---|
| `src/hooks/useVisibilityTick.ts` | New hook |
| `src/components/app/WorkflowActivityCard.tsx` | Use visibility-aware tick |
| `src/components/app/GlobalGenerationBar.tsx` | Use visibility-aware tick |
| `src/components/app/QueuePositionIndicator.tsx` | Use visibility-aware tick |

