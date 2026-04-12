

# Improve Aesthetic Color Picker UI — Square Swatch Grid

## What changes
Replace the flat pill-chip layout (lines 2173-2217) with a square-card swatch grid matching the `BackgroundSwatchSelector` visual pattern.

## Implementation — `src/components/app/product-images/ProductImagesStep3Refine.tsx`

### Replace lines 2173-2217 with:

1. **Add state** for a `ColorPickerDialog` instance dedicated to aesthetic color (pickerOpen boolean, near existing aesthetic color state)

2. **Grid layout** — `grid grid-cols-4 sm:grid-cols-8 gap-1.5`

3. **Preset swatch cards** — same 8 presets (Teal, Terracotta, Sage, etc.), each rendered as:
   - `<button>` with `relative rounded-xl overflow-hidden`
   - `aspect-square w-full` div with `backgroundColor: swatch.hex`
   - Bottom gradient overlay with label: `bg-gradient-to-t from-black/40 to-transparent`, `text-[9px] font-medium text-white`
   - Selected: `ring-2 ring-primary shadow-md` + checkmark badge (top-right, `w-4 h-4 rounded-full bg-primary`) + X button (top-left, `bg-black/60 hover:bg-destructive`)
   - Unselected: `ring-1 ring-border hover:ring-primary/30 hover:shadow-sm`
   - Click toggles selection via `update({ aestheticColorHex: ... })`

4. **Custom color card** — last grid item with `bg-muted/30` fill, centered `Plus` icon + "Custom" label, opens `ColorPickerDialog` in solid-only mode (`mode="solid"`). When a custom color is active and not matching any preset, this card shows the custom hex fill with the same selected styling.

5. **Keep existing clear link** below the grid (`✕ Clear aesthetic color`)

6. **ColorPickerDialog** instance — reuse the existing component, wired to apply via `update({ aestheticColorHex: hex })`. No save-to-palette needed here (pass `canSave={false}`).

### Files changed
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — ~45 lines replaced in the aesthetic color section

