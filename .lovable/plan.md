

## Fix: Scenes Reset to 0 on Settings Step

### Root Cause

The `useEffect` at line 380-417 has `variationStrategy` as a dependency. Since `variationStrategy` is derived inline (`workflowConfig?.variation_strategy`), it produces a **new object reference** on every render — even when the data hasn't changed. This causes the effect to re-run and execute `setSelectedVariationIndices(new Set())` (line 404), wiping out the user's scene selections when transitioning between phases/steps.

### Fix — 1 file

**`src/pages/Generate.tsx`**

1. **Guard the scene reset** so it only runs once on initial workflow load, not on subsequent re-renders. Add a ref to track whether the initial variation setup has been done:

```typescript
const variationInitRef = useRef<string | null>(null);
```

2. **Update the useEffect** (line 401-408) to only set `selectedVariationIndices` when the workflow ID changes (not on every reference change):

```typescript
// Inside the useEffect at line 380:
if (variationStrategy?.variations?.length && variationInitRef.current !== activeWorkflow.id) {
  variationInitRef.current = activeWorkflow.id;
  if (variationStrategy.type === 'scene') {
    setSelectedVariationIndices(new Set());
  } else {
    setSelectedVariationIndices(new Set(variationStrategy.variations.map((_, i) => i)));
  }
}
```

3. **Remove `variationStrategy` from the dependency array** (line 417) since we now guard by workflow ID:

```typescript
}, [activeWorkflow, workflowConfig]);
```

This ensures scenes are initialized once when the workflow loads, and never reset when the user navigates between phases (scenes → model → final settings).

