

## Fix: Library Image Deletion Not Working

### Root Cause

The `confirmDelete` function in `src/pages/Jobs.tsx` does not check the `{ error }` response from Supabase delete/update calls. The Supabase JS client **does not throw** on failure -- it returns an `{ error }` object. Since the code never inspects this, deletions silently fail while still showing "Image deleted" success toast.

### The Fix

**File: `src/pages/Jobs.tsx` (lines 104-137)**

Update the `confirmDelete` function to destructure and check `{ error }` from every Supabase call:

1. For freestyle deletions (line 110): check error from `.delete()`
2. For generation job deletions (lines 124-128): check error from `.delete()` and `.update()`
3. Throw on any error so it falls into the catch block and shows the failure toast

### Technical Detail

```text
// BEFORE (broken -- errors silently ignored):
await supabase.from('freestyle_generations').delete().eq('id', item.id);

// AFTER (fixed -- errors caught):
const { error } = await supabase.from('freestyle_generations').delete().eq('id', item.id);
if (error) throw error;
```

Same pattern applied to the generation_jobs `.delete()` and `.update()` calls.

### Single file change, ~6 lines modified.

