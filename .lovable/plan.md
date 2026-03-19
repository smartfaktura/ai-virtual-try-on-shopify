

## Fix: Duplicate `refCount` declaration crashing `generate-freestyle`

### Root cause
The editing intent bypass added `const refCount` at line 169. The original condensed mode block already had `const refCount` at line 190. Both are in the same function scope (`polishUserPrompt`), so Deno throws `SyntaxError: Identifier 'refCount' has already been declared` and the function cannot boot at all.

### Fix (1 line change)
**File:** `supabase/functions/generate-freestyle/index.ts`

Delete line 190 (`const refCount = ...`). The `refCount` variable from line 169 is already in scope and holds the exact same value. The condensed mode check on line 191 (`if (refCount >= 2 && !isSelfie)`) will use the existing variable.

### Risk
Zero — the variable holds the same computation. Removing the duplicate restores the function to bootable state immediately. Auto-deploys on save.

