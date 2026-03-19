

# Auto-Select Pro Quality When Model or Scene Selected

## Change

In `src/pages/Freestyle.tsx`, add a `useEffect` that watches `selectedModel` and `selectedScene`. When either becomes non-null, set `quality` to `'high'`. When both are cleared back to null, reset to `'standard'`.

This is a soft default — users can still manually switch back to Standard after the auto-selection.

### Implementation

**File: `src/pages/Freestyle.tsx`** (around line 60-75)

Add a `useEffect`:
```typescript
useEffect(() => {
  if (selectedModel || selectedScene) {
    setQuality('high');
  } else {
    setQuality('standard');
  }
}, [selectedModel, selectedScene]);
```

This mirrors the existing pattern in `WorkflowSettingsPanel.tsx` (line 162) where Selfie/UGC workflows force `setQuality('high')`.

Single file, ~5 lines added.

