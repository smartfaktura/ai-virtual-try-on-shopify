

# Debug Analysis: Product Images Flow — Round 4

## Previous 23 issues — all resolved. Four new issues found.

### 1. `customizedCount` inflated by INITIAL_DETAILS defaults
**File:** `ProductImagesStep3Refine.tsx` line 1020
**Severity:** Medium (UX)
**Issue:** `customizedCount` counts ALL non-empty, non-ignored fields. But `INITIAL_DETAILS` ships with 7 non-empty values (`backgroundTone: 'auto'`, `negativeSpace: 'auto'`, `surfaceType: 'auto'`, `lightingStyle: 'soft-diffused'`, `shadowStyle: 'natural'`, `mood: 'auto'`, `brandingVisibility: 'product-accent'`). On first mount with zero user changes, the badge shows "7 customized" — misleading.
**Fix:** Compare each field against `INITIAL_DETAILS` — only count fields whose value differs from the initial default. Import or replicate the initial values as a baseline reference.

### 2. `insufficient_credits` break only exits inner loop
**File:** `ProductImages.tsx` lines 389-392
**Severity:** Medium
**Issue:** When a 402 (insufficient credits) is returned, `break` only exits the innermost `for (let i = 0; i < imgCount; i++)` loop. The outer scene loop and product loop continue, firing more enqueue calls that will also fail with 402 — wasting API calls and potentially showing duplicate error toasts.
**Fix:** Use a flag (e.g., `let aborted = false`) checked in both outer loops, or refactor to an early return after the first 402.

### 3. Fallback prompt path skips person directive when presentation is auto
**File:** `productImagePromptBuilder.ts` line 782
**Severity:** Low
**Issue:** In the no-template fallback path (lines 770-789), the person directive is only appended when `!isAuto(details.presentation)`. But scenes with `personDetails` in their `triggerBlocks` should get a default person directive even when all person settings are on auto. The template-based path handles this correctly via `{{personDirective}}` → `buildPersonDirective()`, which checks `sceneNeedsPerson` and injects defaults. The fallback path misses this.
**Fix:** Change line 782 from checking `!isAuto(details.presentation)` to checking if the scene's triggerBlocks include `personDetails` or `actionDetails`, mirroring the template path behavior.

### 4. Review step shows "auto" aesthetic entries as noise
**File:** `ProductImagesStep4Review.tsx` lines 53-61
**Severity:** Low (UX)
**Issue:** `aestheticEntries` includes entries like "Color world: Auto", "Background: Auto", "Surface: Auto" for every field that has a value — even if that value is just `'auto'`. This clutters the review with non-information. Users see 7 badges when they haven't actually changed anything.
**Fix:** Filter out entries where the value is `'auto'` (or the friendly label resolves to "Auto") since those represent unchanged defaults.

## Files to Update

| File | Changes |
|------|---------|
| `ProductImagesStep3Refine.tsx` | Compare against INITIAL_DETAILS baseline for customizedCount (#1) |
| `ProductImages.tsx` | Add abort flag for insufficient_credits in enqueue loops (#2) |
| `productImagePromptBuilder.ts` | Fix fallback path to inject personDirective for person-trigger scenes (#3) |
| `ProductImagesStep4Review.tsx` | Filter out 'auto' values from aesthetic entries (#4) |

