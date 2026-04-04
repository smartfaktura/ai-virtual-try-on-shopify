

# Product Images Flow — UX Fixes Round 4

## 4 Issues to Fix

### 1. Sticky bar overlaps floating chat button

**Root cause**: The `ProductImagesStickyBar` uses `sticky bottom-0` which pins at the bottom of the scroll container. But the `StudioChat` floating button is `fixed bottom-4 left-4` (z-40), and on catalog pages it moves to `right-4`. Both compete for the same viewport space.

**Fix**: Add `mb-16` (64px margin-bottom) to the sticky bar wrapper so it sits above the floating chat button. Also improve readability by increasing text contrast and spacing slightly.

**File**: `ProductImagesStickyBar.tsx` — add bottom margin via a wrapper in `ProductImages.tsx`, and improve text styling for better readability.

### 2. Reset scenes/details when product selection changes

**Current**: User can select products, go to scenes, come back, change products, but old scene/detail selections persist — causing stale/misleading state.

**Fix**: In `ProductImages.tsx`, add a `useEffect` watching `selectedProductIds` that resets `selectedSceneIds` and `details` back to defaults whenever the product set changes (but not on initial mount).

**File**: `ProductImages.tsx` — add a ref to track previous product IDs and reset downstream state on change.

### 3. Model selector integration for scenes requiring a person

**Current**: When user selects scenes like "In-Hand" or "Portrait with Product", they get generic person detail chips (age range, skin tone) but no way to pick from their existing brand models or the app's model library.

**Fix**: Add a model selector section to Step 3 that appears when `personDetails` is triggered. Show the user's brand models (from `useUserModels`) and the global model library (from `useCustomModels`). Use `ModelSelectorCard` for display. Store selected model ID in `details.selectedModelId`. This replaces the generic person detail chips (age, skin tone, etc.) — if a model is selected, those fields are hidden since the model already defines them.

**Files**:
- `ProductImagesStep3Details.tsx` — Accept new props for models, render a model picker grid when `personDetails` block is triggered, hide generic person chips if model is selected
- `types.ts` — Add `selectedModelId?: string` to `DetailSettings`
- `ProductImages.tsx` — Load models via hooks, pass to Step3

### 4. Fix "Focus Area" block — smart defaults based on product context

**Current**: The `detailFocus` block always shows generic options (Material/Texture, Label/Logo, Hardware/Details, Packaging, Full Product) regardless of what the product actually is. If user uploads a lipstick and selects "Product Near Lips", asking about "Hardware/Details" makes no sense.

**Fix**: Make the `detailFocus` `BlockFields` context-aware. When triggered by makeup/beauty scenes (IDs starting with `makeup-` or `beauty-`), show relevant options like "Product Focus", "Texture/Formula", "Label", "Full Product". For other categories, keep current options. Also rename the block title to "What to focus on" for clarity.

**File**: `ProductImagesStep3Details.tsx` — update the `detailFocus` case in `BlockFields` to accept the triggering scene ID and adjust options accordingly.

## Summary of file changes

| File | Change |
|------|--------|
| `ProductImagesStickyBar.tsx` | Improve text readability, slightly more padding |
| `ProductImages.tsx` | Add bottom spacer for sticky bar, reset scenes/details on product change, load models and pass to Step3 |
| `ProductImagesStep3Details.tsx` | Add model selector grid when personDetails triggered, context-aware focus options, accept model props |
| `types.ts` | Add `selectedModelId` to `DetailSettings` |

