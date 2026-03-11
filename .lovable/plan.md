

## Fix: Credit Counting Logic Across Workflows

### Problems Found

**1. `calculateCost` (balance check) doesn't match displayed cost**
In `handleGenerateClick` (line 623), the balance check uses `calculateCost({ count: imageCount, quality, mode, hasModel })` which returns `count * 8` for try-on — ignoring multi-scene and multi-product. So a user with 8 credits could start a 32-credit job because the guard only checks for 8.

**2. Quality text shows wrong per-image cost**
The UI displays "16 credits each" for high quality (lines 3475, 3584), but the backend and the actual `creditCost` formula both always use 8 per image regardless of quality. This causes the displayed total to appear correct while the breakdown text is misleading/wrong.

**3. `extraProductCredits` computed but never added to `creditCost`**
Line 1357 calculates extra credits for flat lay multi-product, but line 1361 never includes it: `creditCost = singleProductCreditCost * multiProductCount` — missing `+ extraProductCredits`.

### Fix: `src/pages/Generate.tsx`

**A. Remove `calculateCost` from balance check, use `creditCost` directly**
- Line 623: Replace `calculateCost(...)` with the already-computed `creditCost` variable. This is the single source of truth that accounts for scenes, products, angles, and variations.

**B. Fix quality text in UI breakdowns**
- Line 3475 (workflow settings): Change `quality === 'high' ? 16 : 8` to just `8`
- Line 3584 (try-on settings): Change `quality === 'high' ? 16 : 8` to just `8`
- These match the backend which always charges 8 per workflow/try-on image

**C. Include `extraProductCredits` in `creditCost`**
- Line 1361: Change to `const creditCost = (singleProductCreditCost * multiProductCount) + extraProductCredits;`

Four line-level edits in a single file. No backend changes needed since the backend pricing is already correct at 8 credits per image.

