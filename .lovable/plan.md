

# Fixes for Setup Step: Scroll, Wizard Label, Models, and Unified Style Section

## Issues to fix

1. **Wizard stepper still says "Refine"** — `STEP_DEFS` in `ProductImages.tsx` line 47 still has `'Refine'`
2. **Scroll lands in the middle** — `wizardContentRef` scrolls to `block: 'start'` but the ref is on the content div below the stepper/context strip, so it works correctly in theory; the issue is likely that the scroll offset doesn't account for the sticky header. Fix by adding a small negative scroll margin.
3. **Model cards show full body (3:4 ratio)** — `ModelSelectorCard` uses `aspect-[3/4]` with `object-cover`, showing full body. For the inline picker in Setup, models should show face-focused circles, not full cards.
4. **Choose model has an icon (Users) that shouldn't be there** — remove the triple-avatar decorative circles from the header
5. **Style direction and Outfit & Model styling feel like separate things** — merge them into one unified section so preset cards and custom outfit/appearance controls are clearly connected

## Changes

### File: `src/pages/ProductImages.tsx`
- Line 47: Change `'Refine'` → `'Setup'`
- Line 227: Add `scrollMarginTop` approach — change the ref div (line 667) to include `scroll-mt-4` class so the scroll accounts for spacing

### File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`

#### A. Model picker: face circles instead of full cards
Replace the `ModelSelectorCard` grid in `ModelPickerSections` (lines 113-116 and 140-143) with small circular face thumbnails:
- Render each model as a `w-12 h-12 rounded-full` button with `object-cover object-top` (crops to face area)
- Show name on hover via tooltip or small label below
- Selected state: `ring-2 ring-primary`
- This removes the need for zooming to see faces — they're already cropped circles

#### B. Remove the decorative triple-avatar icon from "Choose model" header
Lines 1581-1587: Remove the `flex -space-x-1.5` div with the three circles. Keep just the text "Choose model".

#### C. Merge Style direction + Outfit & Model styling into one section
Currently these are two separate sections (lines 1649-1667 and 1669-1715). Merge into a single section:

```
Style & Appearance
Choose the overall look and fine-tune styling details.

[Style direction preset cards]  ← always visible
[Outfit details]                ← collapsible
[Appearance]                    ← collapsible
```

- Remove the separate "Style direction" section header
- Move `OutfitPresetsOnly` inside the existing `Card` at line 1671, placing it above the collapsibles
- Add a subtle label "Presets" above the preset cards row
- Rename the section title from "Outfit & Model styling" to "Style & Appearance"
- Keep the "Locked across all on-model scenes" note near the presets
- This makes it clear that presets control the same outfit/appearance settings below

#### D. Fix scroll-to-top
The component itself should have no scroll logic change needed — the fix is in `ProductImages.tsx` adding `scroll-mt-4` to the ref div.

### Files modified
1. `src/pages/ProductImages.tsx` — "Refine" → "Setup" + scroll margin fix
2. `src/components/app/product-images/ProductImagesStep3Refine.tsx` — circle model thumbnails, remove decorative icon, merge style sections

