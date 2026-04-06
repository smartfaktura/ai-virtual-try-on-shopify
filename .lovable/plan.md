

# Simplify Background Selector — Remove Custom Panels

## Problem
The current custom color/gradient cards with collapsible panels are over-engineered and clunky. The user wants a simple, direct way to pick a color — not separate cards that expand into large panels.

## Approach
Remove the Custom Color and Custom Gradient cards + collapsible panels entirely. Instead, add a single small "+" card at the end of the grid that opens a native browser color picker (`<input type="color">`). When the user picks a color, it gets applied immediately as a `custom` background value and the "+" card shows the chosen color fill. Same for gradient: a second "+" card with two native color inputs (from/to).

## Changes — `ProductImagesStep3Refine.tsx`

**1. Remove collapsible panels and `ColorPaletteGrid`**
- Delete `ColorPaletteGrid` component (~20 lines)
- Delete both `Collapsible` blocks (~65 lines)
- Delete `COLOR_PALETTE` array

**2. Replace Custom Color card with native color picker**
- Keep the "+" card in the grid but wire it to a hidden `<input type="color">` 
- Clicking the card triggers the native OS color picker
- Once a color is chosen, the card fills with that color and `custom` is toggled on
- The HEX value is stored via `applyCustomHex` as before

**3. Replace Custom Gradient card with dual native pickers**
- Same "+" card pattern but clicking opens two sequential native color inputs (from/to)
- Show the gradient fill on the card once both are set
- Uses hidden `<input type="color">` elements triggered programmatically

**4. Result: clean grid, no panels**
- 12 preset cards + 2 "+" cards (custom color, custom gradient) = 14 cards total
- No collapsible panels, no palette grids, no HEX text inputs
- Native color picker provides full color selection on hover/click
- Cards stay at `aspect-[4/3]`, 6-per-row

```text
Grid (6 per row):
[White] [Off-White] [Gray] [Warm] [Cool] [Taupe]
[Sage]  [Blush]     [Char] [Soft] [Warm] [Cool]
[+ 🎨]  [+ ↗]       ← native picker on click
```

## Files
| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | Remove `ColorPaletteGrid`, `COLOR_PALETTE`, both `Collapsible` panels; wire custom cards to hidden `<input type="color">` elements |

