

# Debug Analysis: Product Images Flow — Round 3

## Previous fixes verified
All 17 previously identified issues are resolved. Six new issues found.

## New Issues

### 1. OutfitConfig init effect has empty deps — stale on category change
**File:** `ProductImagesStep3Refine.tsx` line 782-787
**Severity:** Medium
**Issue:** The `useEffect(() => { if (!details.outfitConfig) update({ outfitConfig: defaultConfig }); }, [])` only runs on mount. If a user visits Step 3 with garment products, the effect writes garment outfit defaults. Then they go back to Step 1, swap products to shoes, return to Step 3 — the effect doesn't re-run. The outfit config stays as garment defaults even though `defaultConfig` has changed.
**Fix:** Change deps to `[defaultConfig]` so it re-evaluates when category/gender changes. Guard: only write if `details.outfitConfig` is undefined OR if the category has changed (track previous category in a ref).

### 2. handleReset wipes outfitConfig, init effect won't re-fire
**File:** `ProductImagesStep3Refine.tsx` lines 1010-1011 + 782-787
**Severity:** Medium
**Issue:** `handleReset` sets details to `{ aspectRatio, quality, imageCount }` — this clears `outfitConfig` to `undefined`. But the init effect has `[]` deps, so it won't fire again. Result: UI shows defaults via `currentConfig = details.outfitConfig || defaultConfig`, but prompt builder falls through to `categoryOutfitDefaults()` flat strings (slightly different wording). The UI/prompt mismatch from issue #1 (previous round) resurfaces after reset.
**Fix:** Resolving issue #1 above (changing deps to include `defaultConfig`) will also fix this, since `outfitConfig` becoming undefined triggers the effect.

### 3. Review step shows person details when model is selected
**File:** `ProductImagesStep4Review.tsx` lines 63-67
**Severity:** Low (UX)
**Issue:** The Review step renders `presentation`, `ageRange`, `skinTone` entries regardless of whether `selectedModelId` is set. But the prompt builder (line 452) skips all person detail fields when a model is selected. The Review shows data the prompt will ignore — misleading the user.
**Fix:** Wrap person detail entries in a `!details.selectedModelId` check, only showing "Model: Selected" when one is chosen.

### 4. Built-in presets ignore gender
**File:** `ProductImagesStep3Refine.tsx` lines 656-673
**Severity:** Low (UX)
**Issue:** `getBuiltInPresets(cat)` always uses the base female defaults from `CATEGORY_OUTFIT_CONFIG_DEFAULTS`. When a male model is selected, the built-in "Studio Standard" preset shows female garments (fitted t-shirt, beige trousers). Loading it would override the user's male-aware defaults with female ones.
**Fix:** Pass `isMale` to `getBuiltInPresets` and use `MALE_OUTFIT_OVERRIDES` when applicable.

### 5. CustomHexPanel stale local state
**File:** `ProductImagesStep3Refine.tsx` lines 533-534
**Severity:** Low
**Issue:** `localHex` is initialized from `accentColor` prop via `useState`. If the user clicks "Auto (Recommended)" or "Reset", the parent clears `accentColor` to `''`. But `useState` only uses the initial value — `localHex` keeps showing the old hex. When the user re-opens the hex panel, the stale color is shown.
**Fix:** Add a `useEffect` to sync `localHex` when `accentColor` prop changes: `useEffect(() => setLocalHex(accentColor || '#000000'), [accentColor])`.

### 6. Review doesn't show outfit summary
**File:** `ProductImagesStep4Review.tsx`
**Severity:** Low (UX)
**Issue:** The Review step shows aesthetic and person entries but has no section for the outfit config. Users can't verify what outfit will be locked before generating.
**Fix:** Add an outfit summary section that reads `details.outfitConfig` and displays each piece (e.g., "Top: fitted white cotton t-shirt").

## Files to Update

| File | Changes |
|------|---------|
| `ProductImagesStep3Refine.tsx` | Fix outfit init effect deps (#1/#2), pass gender to built-in presets (#4), sync CustomHexPanel (#5) |
| `ProductImagesStep4Review.tsx` | Guard person entries behind model check (#3), add outfit summary (#6) |

