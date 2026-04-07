

# Modernize Color Picker — Clearer Custom Color Button + Better UX

## Problem
1. The small color well (40x40 square with a tiny pipette icon) is not obviously clickable — users don't realize they can tap it to open the native color picker
2. The native browser `<input type="color">` picker looks dated and varies wildly across browsers

## Changes

### File: `src/components/app/product-images/ColorPickerDialog.tsx`

**1. Replace the hidden color-well with an explicit "Pick custom color" button**

Instead of a small square with a hidden `<input type="color">` overlay, add a clear button labeled "Pick custom color" with a Pipette icon. This button triggers the hidden `<input type="color">`. Users immediately understand they can click it.

**2. Add an HSL hue slider as a modern inline picker alternative**

Build a simple inline hue+saturation picker using two `<input type="range">` sliders styled with gradient track backgrounds via Tailwind:
- **Hue slider** — a horizontal bar showing the full rainbow spectrum (0-360)
- **Lightness slider** — shows dark-to-light for the selected hue

This gives a modern, visual way to pick any color without relying on the browser's native picker or knowing hex codes. The sliders update the hex value in real time.

**3. Reorganize the Solid tab layout**

```text
┌─────────────────────────────┐
│  Custom Color           ✕   │
│  [Solid] [Gradient]         │
│                             │
│  Quick pick                 │
│  ○ ○ ○ ○ ○ ○               │
│  ○ ○ ○ ○ ○ ○               │
│                             │
│  Custom                     │
│  ═══════════════ (hue)      │
│  ═══════════════ (light)    │
│                             │
│  [███] HEX [#FF5522  ]     │
│                             │
│  [Save to palette]          │
│  [Cancel]  [Apply]          │
└─────────────────────────────┘
```

**4. Technical approach for the sliders**

- Store `hue` (0-360) and `lightness` (10-95) as local state, derived from the current hex on open
- Hue slider: `background: linear-gradient(to right, hsl(0,70%,50%), hsl(60,70%,50%), hsl(120,70%,50%), hsl(180,70%,50%), hsl(240,70%,50%), hsl(300,70%,50%), hsl(360,70%,50%))`
- Lightness slider: dynamic gradient based on selected hue `hsl(H,70%,10%)` to `hsl(H,70%,95%)`
- Convert HSL to hex on change, update hex/hexInput state
- When a swatch is clicked or hex is typed manually, reverse-convert to update hue/lightness sliders
- Style the range inputs with Tailwind + `appearance-none`, rounded thumb with border

**5. Keep the native picker as a fallback**

The `<input type="color">` remains but is now triggered by a small explicit button ("Eyedropper") rather than an invisible overlay on a color square.

**6. Apply same slider approach to Gradient tab**

Each gradient stop (Start/End) gets a mini hue slider inline, replacing the confusing color-well-with-hidden-input pattern.

## Summary
- Swatches remain as the easiest one-tap option
- Modern inline hue+lightness sliders replace the hidden native picker as the primary "custom" method
- Native picker still accessible via explicit "Eyedropper" button
- No new dependencies — pure CSS gradients on range inputs
- No database changes needed

