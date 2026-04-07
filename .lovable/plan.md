

# Improve Color Picker: Modern Dialog-Based Custom Color & Gradient Editor

## Problem

Currently, clicking "Custom" or "Gradient" triggers a hidden native `<input type="color">` which opens the OS-level color picker — a clunky, inconsistent experience with no hex input field and no gradient preview. The gradient card also doesn't show a real gradient preview when inactive.

## Solution

Replace the hidden native color inputs with a modern **Dialog-based color picker** (Figma/Canva style) that opens when clicking the Custom or Gradient swatch cards. Two modes inside the dialog: **Solid Color** and **Gradient**.

## Changes

### File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`

#### 1. Add a `ColorPickerDialog` component (~120 lines)

A `<Dialog>` with two tabs: **Solid** and **Gradient**.

**Solid tab:**
- Large color preview square (the selected color)
- Native `<input type="color">` displayed inline as a visible picker canvas (not hidden)
- Hex input field with `#` prefix, validated on blur
- RGB display (read-only, derived from hex)
- "Save to palette" button (if `canSave`)
- "Apply" and "Cancel" buttons

**Gradient tab:**
- Large gradient preview bar showing `linear-gradient(135deg, from, to)`
- Two color wells side by side labeled "Start" and "End"
- Each well: clickable swatch + hex input field
- Clicking a well opens an inline native color picker for that stop
- Gradient angle selector (optional, default 135deg)
- "Save to palette" button
- "Apply" and "Cancel" buttons

#### 2. Update `BackgroundSwatchSelector`

- Remove the 3 hidden `<input type="color">` refs (`colorInputRef`, `gradFromInputRef`, `gradToInputRef`)
- Add state: `pickerOpen: boolean`, `pickerMode: 'solid' | 'gradient'`
- **Custom card click** → `setPickerMode('solid'); setPickerOpen(true); toggleSwatch('custom')`
- **Gradient card click** → `setPickerMode('gradient'); setPickerOpen(true); toggleSwatch('gradient-custom')`
- **Edit button click** → same as above but doesn't re-toggle
- Render `<ColorPickerDialog>` at the bottom of the component

#### 3. Fix gradient preview on the Gradient swatch card

Currently the "Gradient" card in the grid only shows a gradient when `hasGradientCustom` is true. Update the inactive state to show a subtle default gradient preview (`linear-gradient(135deg, #F0F0F0, #D8D8D8)`) instead of a blank `+` icon, so users understand it's a gradient option.

#### 4. Dialog design details

```
┌─────────────────────────────────┐
│  Custom Color              [X]  │
├─────────────────────────────────┤
│  [ Solid ]  [ Gradient ]        │  ← Tabs
│                                 │
│  ┌─────────────────────────┐    │
│  │                         │    │  ← Large preview
│  │     Color Preview       │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌──────┐  Hex: [#FF5522  ]    │  ← Native picker + hex input
│  │picker│                       │
│  └──────┘  RGB: 255, 85, 34    │
│                                 │
│  [Save to palette]              │
│                                 │
│  ────────────────────────────── │
│         [Cancel]  [Apply]       │
└─────────────────────────────────┘
```

For gradient mode:
```
┌─────────────────────────────────┐
│  Custom Color              [X]  │
├─────────────────────────────────┤
│  [ Solid ]  [ Gradient ]        │
│                                 │
│  ┌─────────────────────────┐    │
│  │  ← gradient preview →   │    │  ← Full gradient bar
│  └─────────────────────────┘    │
│                                 │
│  Start           End            │
│  ┌──────┐        ┌──────┐      │
│  │picker│        │picker│      │
│  └──────┘        └──────┘      │
│  [#F8F8F8]       [#EEEEEE]     │  ← Hex inputs
│                                 │
│  [Save to palette]              │
│         [Cancel]  [Apply]       │
└─────────────────────────────────┘
```

### Imports needed

- Already have: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Tabs`, `TabsList`, `TabsTrigger`, `Input`, `Button`, `Badge`, `Save`
- No new dependencies needed — using native `<input type="color">` displayed visually (not hidden) as the color canvas

## Result

Clicking Custom or Gradient opens a polished dialog with proper hex input, visual color picker, live preview, and save-to-palette — matching modern design tool UX. The native OS picker popup is eliminated.

