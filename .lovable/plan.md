

## Fix Upscale Prompt Display

### Problem
When an upscale job can't find the source record's prompt, it falls back to showing `"Upscaled from generation/13ed27d7-..."` — an ugly internal ID that users should never see.

### Change — 1 file

**`supabase/functions/upscale-worker/index.ts`** (line 189):

Change the fallback prompt from the technical ID string to a clean user-facing label:

```typescript
// Before:
let sourcePrompt = `Upscaled from ${sourceType}/${sourceId}`;

// After:
let sourcePrompt = `Enhanced to ${resolution === '4k' ? '4K' : '2K'}`;
```

This way, even if the source record lookup fails, the prompt field shows something clean like "Enhanced to 2K" instead of internal IDs. When the source is found, it still inherits the original prompt as before.

