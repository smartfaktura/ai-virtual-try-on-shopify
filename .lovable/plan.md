

# Product Images Refine & Review Fixes

## Changes

### 1. Add "Auto" recommended button to Overall Aesthetic section
Add a prominent "Auto (Recommended)" button at the top of the Overall Aesthetic card that pre-fills all aesthetic fields with smart defaults based on the product category. When clicked, it sets: Color world=auto, Background=auto, Surface=auto, Lighting=soft-diffused, Shadow=natural, Styling=auto, Accent=none. A second click or individual chip changes switch to manual mode.

**File**: `ProductImagesStep3Refine.tsx`
- Add an "Auto (Recommended)" pill/button above the chip grid, highlighted with a Sparkles icon
- When selected, populate all aesthetic fields with `auto` or smart defaults
- Show a subtle badge "Auto settings applied" when active

### 2. Enhance Accent Color with custom hex input
Add a "Custom" option to the accent color chips. When selected (or when "Use brand accent" is selected but no brand profile exists), show a modern inline hex color picker panel:
- Small color preview swatch + hex input field (`#000000` format)
- Validate hex format on blur
- Store in `details.accentColor` (new field on `DetailSettings`)

**File**: `ProductImagesStep3Refine.tsx` — add "Custom" chip option + inline hex panel
**File**: `types.ts` — add `accentColor?: string` to `DetailSettings`
**File**: `productImagePromptBuilder.ts` — use `details.accentColor` hex value in the `accentDirective` token when set

### 3. Fix product thumbnail zoom on Review step
The product thumbnails in the Review card use `object-cover` on 40x40px boxes, which crops heavily into small product images. Fix by switching to `object-contain` with a white background so the full product is visible at review.

**File**: `ProductImagesStep4Review.tsx`
- Line 110: Change `object-cover` → `object-contain` on the product `<ShimmerImage>`
- Add `bg-white` to the container div for clean contain rendering

## Files Modified

| File | Change |
|------|--------|
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Add Auto button + custom hex accent panel |
| `src/components/app/product-images/ProductImagesStep4Review.tsx` | Fix product thumbnail to `object-contain` |
| `src/components/app/product-images/types.ts` | Add `accentColor?: string` to DetailSettings |
| `src/lib/productImagePromptBuilder.ts` | Use hex accent color in prompt when set |

