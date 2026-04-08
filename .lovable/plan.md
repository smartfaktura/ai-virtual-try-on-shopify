

# Replace Ocean Gradient with Forest Green + Fix Custom Gradient Card Appearance

## Changes

### 1. Replace Ocean with Forest in `ProductImagesStep3Refine.tsx`
In `BG_SWATCH_OPTIONS`, change the `gradient-cool` entry from Ocean (`#1C6CA0 → #C7E6F5`) to Forest (`#0F570F → #EAFBE9`), label "Forest".

### 2. Fix Custom Gradient card appearance — same file
The "Gradient" card currently shows a flat gray with a `+` icon when unselected. Replace with a rainbow/multi-color gradient preview so it visually communicates "custom gradient creation":
- Default (unselected) background: a subtle multi-stop gradient (e.g. `linear-gradient(135deg, #F8B4C8, #C8A8E8, #A8D8EA, #B8E8C8)`) instead of the current gray
- Keep the `+` icon overlaid on top
- Update label from "Gradient" to "Custom"

### 3. Update prompt builder mapping in `productImagePromptBuilder.ts`
Change `gradient-cool` description from ocean blue to forest green:
```
'gradient-cool': 'cool gradient background fading from deep forest green to soft mint cream'
```

### 4. Update `ColorPickerDialog.tsx`
Replace the Ocean preset with Forest in `GRADIENT_PRESETS`:
```
{ name: 'Forest', from: '#0F570F', to: '#EAFBE9' }
```

## Files modified
1. `src/components/app/product-images/ProductImagesStep3Refine.tsx` — swap Ocean→Forest in swatches + fix gradient card preview
2. `src/lib/productImagePromptBuilder.ts` — update `gradient-cool` description
3. `src/components/app/product-images/ColorPickerDialog.tsx` — swap Ocean→Forest in picker presets

