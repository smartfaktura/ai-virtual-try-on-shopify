

# Improve Custom Color Picker — Quick Swatches + Example Gradient

## Problem
Currently the color picker only has a native browser color input and a hex text field. Users who don't know color codes have no easy way to pick colors. There are also no example gradients showing branded combinations.

## Changes

### File: `src/components/app/product-images/ColorPickerDialog.tsx`

**1. Add preset quick-pick swatches to the Solid tab**

Add a grid of 12 clickable color swatches above the hex input — common colors users would want for product backgrounds. One tap selects the color instantly (no codes needed).

Preset swatches:
- `#FFFFFF` (White), `#F5F5F5` (Off-white), `#E8E8E8` (Light grey), `#D4D4D4` (Silver)
- `#FAFAF0` (Cream), `#F5E6D3` (Beige), `#FFE4E1` (Blush), `#E6F0FA` (Ice blue)
- `#2B3A4E` (Brand navy — derived from primary), `#1A1A2E` (Deep navy), `#3D3D3D` (Charcoal), `#000000` (Black)

Layout: 2 rows of 6 circular swatches with border, check mark on selected. Clicking a swatch sets the hex value immediately.

**2. Add preset gradient examples to the Gradient tab**

Add a row of 4 clickable gradient thumbnails including the branded example:
- White-to-grey: `#FFFFFF → #E8E8E8`
- **White-to-brand navy: `#FFFFFF → #2B3A4E`** (the branded dark blue example)
- Warm cream: `#FFF8F0 → #F5E6D3`
- Cool blue: `#F0F4FF → #D4E4FA`

Clicking a preset fills in the Start/End fields instantly.

**3. Keep the native picker + hex input as "advanced" option**

The hex input and native color picker remain below the swatches for power users, but the swatches become the primary interaction — just tap a color, done.

**4. Remove RGB readout**

The R/G/B numbers add clutter and aren't useful for the target audience. Remove that section.

### Visual layout (Solid tab)

```text
┌─────────────────────────────┐
│  Custom Color               │
│  [Solid] [Gradient]         │
│                             │
│  ┌─────────────────────┐    │
│  │    preview block     │    │
│  └─────────────────────┘    │
│                             │
│  Quick pick:                │
│  ○ ○ ○ ○ ○ ○               │
│  ○ ○ ○ ○ ○ ○               │
│                             │
│  [🎨] HEX [#FFFFFF    ]    │
│                             │
│  [Save to palette]          │
│  [Cancel]  [Apply]          │
└─────────────────────────────┘
```

### Visual layout (Gradient tab)

```text
┌─────────────────────────────┐
│  Quick gradients:           │
│  [□□] [□□] [□□] [□□]       │
│                             │
│  ┌─────────────────────┐    │
│  │  gradient preview    │    │
│  └─────────────────────┘    │
│                             │
│  Start        End           │
│  [🎨 ███]    [🎨 ███]      │
│  [#FFF...]   [#2B3...]     │
│                             │
│  [Save to palette]          │
│  [Cancel]  [Apply]          │
└─────────────────────────────┘
```

## Summary
- Users can now pick colors with zero code knowledge — just tap a swatch
- Branded dark blue gradient (`#FFFFFF → #2B3A4E`) is shown as a preset example
- Advanced hex input stays for power users
- No new files or database changes needed

