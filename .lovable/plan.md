

# Fix Freestyle Detail Modal: Title and Prompt Display

## Problems

1. **Title shows full prompt** — Line 828 in `Freestyle.tsx` sets `label: displayPrompt || 'Freestyle'`, which makes the h2 title display the entire prompt text instead of just "Freestyle".

2. **Prompt shows backend-engineered text** — Line 829 sets `prompt: displayPrompt` which falls back to the engineered prompt (`img.prompt`) when no user prompt exists. User wants: only show the user's own input, never the backend prompt.

## Changes

### `src/pages/Freestyle.tsx` (lines 823-833)

Change the `libraryItem` construction:

```typescript
const libraryItem: LibraryItem = {
  id: img.id,
  imageUrl: img.url,
  source: 'freestyle',
  label: 'Freestyle',                        // Always "Freestyle"
  prompt: img.userPrompt || undefined,        // Only user input, never backend prompt
  date: '',
  createdAt: '',
  aspectRatio: img.aspectRatio || '1:1',
  quality: 'standard',
};
```

### `src/hooks/useLibraryItems.ts` (lines 109-131)

Same fix for the Library page — freestyle items should also only show `user_prompt`:

- Update the freestyle query to include `user_prompt`: `.select('id, image_url, prompt, user_prompt, aspect_ratio, quality, created_at, workflow_label')`
- Change label from `displayLabel` to always `'Freestyle'` when no `workflow_label`
- Change prompt to use `f.user_prompt || undefined` instead of `f.prompt`

## Result

- Title always says "Freestyle"
- Prompt section only shows what the user actually typed
- If user left prompt empty (auto-generated), no prompt is shown at all

