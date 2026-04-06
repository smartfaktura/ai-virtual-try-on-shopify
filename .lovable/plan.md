

# Debug Analysis: Product Images Flow — Issues Found

## Critical Bugs

### 1. Credit calculation mismatch in Refine step
**File:** `ProductImagesStep3Refine.tsx` line 1000
**Issue:** `costPerImage` is hardcoded to `6`, ignoring the quality setting. If user selects "Standard" quality (3 credits), the Refine step still shows 6 credits per image. The Review step (`ProductImagesStep4Review.tsx` line 53) and parent (`ProductImages.tsx` line 196) correctly use `quality === 'standard' ? 3 : 6`.
**Fix:** Read `details.quality` and compute cost dynamically: `const costPerImage = (details.quality || 'high') === 'standard' ? 3 : 6;`

### 2. INITIAL_DETAILS vs AUTO_AESTHETIC_DEFAULTS conflict
**File:** `ProductImages.tsx` line 78 sets `brandingVisibility: 'none'`
**File:** `ProductImagesStep3Refine.tsx` line 507 sets `AUTO_AESTHETIC_DEFAULTS.brandingVisibility: 'product-accent'`
**Issue:** On first mount, `isAutoApplied()` returns `false` because `details.brandingVisibility` is `'none'` (from INITIAL_DETAILS) but Auto expects `'product-accent'`. The "Auto (Recommended)" chip appears inactive even though the user hasn't changed anything. Clicking Auto then sets `product-accent`, which is correct — but the initial state is misleading.
**Fix:** Align `INITIAL_DETAILS.brandingVisibility` to `'product-accent'` to match `AUTO_AESTHETIC_DEFAULTS`.

### 3. Duplicate BLOCK_FIELD_MAP definitions
**File:** `ProductImages.tsx` lines 52-65 AND `ProductImagesStep3Refine.tsx` lines 484-494
**Issue:** Two separate copies of the same map. They can silently drift. The parent uses its copy for stale detail cleanup; the Refine step uses its copy for UI display. If a field is added to one but not the other, either cleanup won't work or UI won't show the field.
**Fix:** Export `BLOCK_FIELD_MAP` from `detailBlockConfig.ts` and import in both files.

### 4. Selected scenes can become stale after excludeCategories filtering
**File:** `ProductImagesStep2Scenes.tsx`
**Issue:** If user selects "In-Hand Studio" for a mixed batch, then removes non-excluded products (leaving only home-decor), the scene gets hidden from the UI but remains in `selectedSceneIds`. The user can proceed to Refine/Review/Generate with a scene that's invisible and incompatible.
**Fix:** After computing `filteredGlobalScenes`, add an effect that removes any selected scene IDs that are no longer visible.

## Medium Bugs

### 5. `buildOutfitDirective` is dead code
**File:** `productImagePromptBuilder.ts` lines 504-511
**Issue:** Reads `d.outfitStyle` and `d.outfitColorDirection` — but the new UI never sets these fields (it uses `outfitConfig` instead). This function always returns `''`, making the fallback in `buildPersonDirective` (line 472) always trigger `defaultOutfitDirective`. Not a runtime bug, but confusing and could mask issues.
**Fix:** Remove `buildOutfitDirective` and its call sites; go directly to `defaultOutfitDirective`.

### 6. Person detail values persist invisibly when model is selected
**File:** `ProductImagesStep3Refine.tsx` line 1311
**Issue:** When `selectedModelId` is set, person detail chips (age, skin tone, expression) are hidden. But if the user first sets `ageRange: '18-25'`, then selects a model, the value stays in `details`. The prompt builder still injects `age 18-25` into the person directive even though the user can't see or edit it.
**Fix:** When a model is selected, clear person detail fields or ignore them in the prompt builder when `selectedModelId` is set.

### 7. `Select All` in Universal scenes doesn't respect `excludeCategories`
**File:** No "Select All" button exists for Universal scenes currently — but the scene selection still allows manual selection of hidden scenes if they were previously selected. Related to issue #4.

## Minor Issues

### 8. Lighting injected for non-global scenes despite scoping
**File:** `productImagePromptBuilder.ts` line 818
**Issue:** `injectIfMissing('lighting', 'lightingDirective')` does NOT pass `globalOnly = true`, so user's lighting override gets injected into recommended/editorial scenes too. The plan said aesthetic overrides should only apply to universal scenes, but lighting leaks through.
**Fix:** Change to `injectIfMissing('lighting', 'lightingDirective', true)`.

### 9. `sceneIntensity` (mood) also leaks to non-global scenes
**File:** `productImagePromptBuilder.ts` line 820
**Issue:** `injectIfMissing('mood', 'sceneIntensityDirective')` — no `globalOnly` flag. Mood override leaks into category scenes.
**Fix:** Add `true` as the third argument.

### 10. `stylingDensity` and `productProminence` leak to non-global scenes
**File:** `productImagePromptBuilder.ts` lines 821-822
**Issue:** Same pattern — these inject into all scenes regardless.
**Fix:** Add `globalOnly = true` to both.

### 11. Missing quality toggle in Refine step
**File:** `ProductImagesStep3Refine.tsx`
**Issue:** The Format & Output section shows aspect ratio and image count, but no quality selector (Standard vs Pro). Quality is set in `INITIAL_DETAILS` as `'high'` and never changed by the user in the Refine UI. The Review step shows it, but users can't change it.
**Fix:** Add a quality ChipSelector (Standard 3cr / Pro 6cr) in the Format section.

## Summary — 11 issues found

| # | Severity | Issue | File |
|---|----------|-------|------|
| 1 | Critical | Credit calc hardcoded to 6 in Refine | Step3Refine |
| 2 | Critical | INITIAL_DETAILS vs Auto defaults mismatch | ProductImages + Step3Refine |
| 3 | Medium | Duplicate BLOCK_FIELD_MAP | ProductImages + Step3Refine |
| 4 | Medium | Stale selected scenes after category filtering | Step2Scenes |
| 5 | Low | Dead `buildOutfitDirective` code | promptBuilder |
| 6 | Medium | Invisible person details persist with model | Step3Refine + promptBuilder |
| 7 | Low | Select All edge case with hidden scenes | Step2Scenes |
| 8 | Medium | Lighting leaks to non-global scenes | promptBuilder |
| 9 | Medium | Mood leaks to non-global scenes | promptBuilder |
| 10 | Medium | Styling/prominence leak to non-global scenes | promptBuilder |
| 11 | Medium | No quality toggle in Refine UI | Step3Refine |

All 11 issues can be fixed in a single implementation pass across 4 files.

