

# Fix Copy Prompt: Only Copy User's Own Prompt

## Problem
When a user clicks "Copy Prompt" on a freestyle image and they didn't write their own prompt, the system falls back to copying the full engineered/system prompt (`img.prompt`). The user wants it to only copy the user's original prompt — if there is none, show a toast saying there's nothing to copy.

## Change

### `src/components/app/freestyle/FreestyleGallery.tsx` — Line 352-356

Update the copy handler to skip copying when no `userPrompt` exists:

```tsx
// Before:
onCopyPrompt(img.userPrompt || img.prompt);
toast.success('Prompt copied to editor');

// After:
if (img.userPrompt) {
  onCopyPrompt(img.userPrompt);
  toast.success('Prompt copied to editor');
} else {
  toast.info('No custom prompt to copy');
}
```

Single file, single change.

