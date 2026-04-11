

# Improve Background Prompt Precision & Custom Labels

## UI Label Fix
**File:** `src/components/app/product-images/ProductImagesStep3Refine.tsx`
- Line 682: `"Custom"` → `"Custom Color"`
- Line 715: `"Custom"` → `"Custom Gradient"`

## Prompt Text Refinements
**File:** `src/lib/productImagePromptBuilder.ts` (lines 604–626)

Minor wording improvements — same structure, same dynamic hex codes, just tighter language:

| Line | Current | Improved |
|------|---------|----------|
| 609 | `solid background in color ${hex}` | `flat solid ${hex} color background, no texture, no pattern` |
| 615 | `smooth gradient background transitioning from ${from} to ${to}` | `smooth gradient background from ${from} to ${to}, no texture, no pattern` |
| 621 | `${swatchResolved} seamless background` | `${swatchResolved} seamless studio background, no texture, no pattern` |

No logic changes — only the returned string text is adjusted to add explicit negative constraints while keeping the dynamic color values in place.

