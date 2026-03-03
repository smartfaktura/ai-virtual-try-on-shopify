

## Fix: Page Refresh on Workflow Generation Start

### Root Cause

`handleWorkflowGenerate` (line 596) is an `async` function called from `handleGenerateClick` (line 589) without `await` and without any `try/catch`. If any of the following async operations throw:

1. `convertImageToBase64()` — fails if a product image URL has expired (signed URLs have TTL)
2. `enqueue()` or `startBatch()` — network failures
3. `Promise.all()` for model/product images

...the unhandled promise rejection propagates, Vite's dev server detects the error, and triggers an HMR reload — causing the page "refresh" the user experienced.

The same issue exists in `handleTryOnConfirmGenerate` (line 730).

### Fix

**`src/pages/Generate.tsx`** — 2 changes:

1. **Wrap `handleWorkflowGenerate` body in try/catch** (lines 596-728): Catch any error, show a toast, and reset to settings step.

2. **Wrap `handleTryOnConfirmGenerate` body in try/catch** (lines 730-779): Same pattern.

```tsx
const handleWorkflowGenerate = async () => {
  try {
    // ... existing body unchanged ...
  } catch (err) {
    console.error('Workflow generation failed:', err);
    toast.error('Something went wrong starting the generation. Please try again.');
    setCurrentStep('settings');
  }
};
```

Same pattern for `handleTryOnConfirmGenerate`.

### Files changed — 1
- `src/pages/Generate.tsx`

