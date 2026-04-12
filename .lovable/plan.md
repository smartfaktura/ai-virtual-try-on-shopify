

# Auto-preselect Recommended Aesthetic Color

## Problem
When a shot with `aestheticColor` trigger is selected, the user lands on Step 3 with no color pre-selected. The "Recommended for your shots" curator picks are visible but require manual selection.

## Solution
Add a `useEffect` in `ProductImagesStep3Refine` that fires when aesthetic color scenes are present and `details.aestheticColorHex` is empty. It picks the first curator pick (`suggestedColors[0]`) from the selected scenes and auto-applies it.

## Change

**`src/components/app/product-images/ProductImagesStep3Refine.tsx`** — add after the `aestheticColorScenes` memo (~line 1731):

```typescript
// Auto-preselect first recommended aesthetic color when scenes need it
useEffect(() => {
  if (aestheticColorScenes.length > 0 && !details.aestheticColorHex) {
    for (const scene of aestheticColorScenes) {
      if (scene.suggestedColors && scene.suggestedColors.length > 0) {
        const pick = scene.suggestedColors[0];
        update({ aestheticColorHex: pick.hex, aestheticColorLabel: pick.label });
        return;
      }
    }
  }
}, [aestheticColorScenes.length]); // Only on scene selection change
```

This ensures:
- First curator pick is auto-selected when entering Step 3
- User can still change or clear it
- No effect if no scenes have `suggestedColors`
- Won't override if user already picked a color

### Files changed
1. `src/components/app/product-images/ProductImagesStep3Refine.tsx` — add one `useEffect`

