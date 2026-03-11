

## Fix Incorrect Credit Display in Virtual Try-On Settings

### Problem
The credit summary text on the try-on settings step shows `16 credits each` when quality is "high", but the actual cost calculation always uses **8 credits per image** (both frontend line 1360 and backend). This causes a misleading display like "1 image × 16 credits each = 32 credits" when the real cost is different.

### Root Cause
Multiple places in `src/pages/Generate.tsx` use `quality === 'high' ? 16 : 8` for the **display text**, but the actual `creditCost` variable is computed differently (always 8 per image for workflows/try-on). The display label is out of sync with the real calculation.

### Fix
**`src/pages/Generate.tsx`** — Replace the hardcoded `quality === 'high' ? 16 : 8` display values with `8` (the actual per-image cost) in all three locations:

1. **Line 3321** (workflow surfaces summary): Change `quality === 'high' ? 16 : 8` → `8`
2. **Line 3475** (workflow scenes summary): Change `quality === 'high' ? 16 : 8` → `8`  
3. **Line 3584** (try-on summary): Change `quality === 'high' ? 16 : 8` → `8`

Also update the descriptive text to properly break down the total by showing the correct multipliers (scene count, product count) so the math adds up visually.

### One file changed
`src/pages/Generate.tsx` — 3 lines updated

