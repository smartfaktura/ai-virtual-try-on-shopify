

## Fix: Show Scene Selection for Selfie/UGC Workflow

### Problem
The Selfie/UGC workflow has `uses_tryon: true` AND has scene variations (Hair Salon, Entryway, Hotel Lobby, etc.). But the scene grid is hidden because of a `!wf.uses_tryon` guard on line 927 — it assumes try-on workflows don't need scene selection, which is wrong for Selfie/UGC.

### Fix (1 file)

**`src/components/app/CreativeDropWizard.tsx`**

1. **Line 927**: Change `{variations.length > 0 && !wf.uses_tryon && (` → `{variations.length > 0 && (` — show scenes for ANY workflow that has variations, regardless of `uses_tryon`.

2. **Line 295 (validation)**: Change `if (variations.length > 0 && !wf.uses_tryon)` → `if (variations.length > 0)` — require scene selection for all workflows with variations, including try-on ones.

3. **Line 313 (hint)**: Same pattern — remove `!wf.uses_tryon` guard from the validation hint so it correctly tells users to select scenes for Selfie/UGC too.

