

# Fix Random/Duplicate Error Toasts on Generate Page

## Problem
When a generation job fails (e.g., timeout), the user sees **two** error toasts:
1. From `useGenerationQueue` hook fallback (line 130): "Generation timed out. Your credits have been refunded."
2. From `Generate.tsx` activeJob effect (line 1489): raw `error_message` like "Timed out after 5 minutes"

This happens because `Generate.tsx` calls `useGenerationQueue` **without** providing `onGenerationFailed`, so the hook fires its own fallback toasts. Then the activeJob status watcher fires a second toast with the raw DB error.

## Changes — `src/pages/Generate.tsx`

### 1. Pass `onGenerationFailed` callback to suppress hook fallback toasts
Add an `onGenerationFailed` callback to the `useGenerationQueue` call (line 170). This callback will handle the error gracefully (set step back to settings, refresh balance) and the hook will skip its own fallback toasts.

### 2. Remove the duplicate toast in activeJob watcher
Remove the `toast.error(activeJob.error_message || ...)` at line 1489. The `onGenerationFailed` callback now handles it with a user-friendly message instead of the raw backend string.

### 3. Show friendly error messages
In the new `onGenerationFailed` callback, show clean messages:
- Timeout: "Generation timed out. Your credits have been refunded."
- Rate limit: "Too many generations at once. Please wait and try again."
- Generic: "Generation failed. Your credits have been refunded — try again."

## Files
- `src/pages/Generate.tsx` only

