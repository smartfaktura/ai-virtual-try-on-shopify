

## Fix "Try Again" Button for Failed Freestyle Generations

The "Try again" button in the failed generation card currently only sets the prompt text via `handleRetryFailed`, but does **not**:
1. Remove the failed entry from the list
2. Actually trigger a new generation

### Root Cause
In `src/pages/Freestyle.tsx` (~line 587-589):
```tsx
const handleRetryFailed = useCallback((failedPrompt: string) => {
  setPrompt(failedPrompt);
}, []);
```
This only populates the prompt field — the user still has to manually click "Generate". The failed card also stays visible.

### Fix

**`src/components/app/freestyle/FreestyleGallery.tsx`** — Change `onRetryFailed` signature to pass `id` along with `prompt`:
- The FailedCard's `onRetry` callback should pass both `entry.id` and `entry.prompt`

**`src/components/app/freestyle/FreestyleGallery.tsx`** (~line 77):
- Change `onRetryFailed?: (prompt: string) => void` to `onRetryFailed?: (id: string, prompt: string) => void`
- Update the FailedCard's `onRetry` prop mapping (~line 516) to call `onRetryFailed?.(entry.id, entry.prompt)`

**`src/pages/Freestyle.tsx`** (~line 587-589):
- Update `handleRetryFailed` to accept `(id: string, failedPrompt: string)`, dismiss the failed entry, set the prompt, and trigger generation:
```tsx
const handleRetryFailed = useCallback((id: string, failedPrompt: string) => {
  setFailedEntries(prev => prev.filter(e => e.id !== id));
  setPrompt(failedPrompt);
  // Use setTimeout to ensure prompt state is set before triggering
  setTimeout(() => {
    handleGenerate();
  }, 0);
}, [handleGenerate]);
```

Since `handleGenerate` reads `prompt` from state and a `setTimeout(0)` won't guarantee the state update, a cleaner approach is to store the retry prompt in a ref and check it in `handleGenerate`, or simply dismiss + set prompt and let the user click Generate (but scroll/focus to the prompt area). 

The most reliable approach: dismiss the failed entry, set the prompt, and scroll to the prompt panel so the user can immediately hit Generate. This avoids race conditions with state:

```tsx
const handleRetryFailed = useCallback((id: string, failedPrompt: string) => {
  setFailedEntries(prev => prev.filter(e => e.id !== id));
  setPrompt(failedPrompt);
  setIsPromptCollapsed(false);
  // Scroll prompt into view
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}, []);
```

This ensures the failed card is removed, the prompt is pre-filled, and the prompt panel is expanded and visible so the user can tap Generate.

