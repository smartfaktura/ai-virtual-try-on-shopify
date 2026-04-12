

# Redesign Scene Card: Move Color Pills Below Title, Remove Subtitle

## Problem
Color dots (background & aesthetic) are overlaid on the preview image, cluttering the visual. The subtitle is truncated and adds no value. Cards without color pills look different from those with them, creating inconsistency.

## Design

Move the bottom content area from:
```
Title
Subtitle (truncated)
```

To:
```
     Title (centered)
  [color pills row, centered]
```

- **Remove subtitle** entirely
- **Center the title** text
- **Move color pills below title** — background dots and/or aesthetic color dots render as a centered row of small circles under the title
- **Cards without pills** get a subtle "Scene" type indicator (e.g., a small `Camera` icon or a neutral dot) so all cards have the same visual weight and height in the bottom area
- Keep the overlay indicators (checkmark for selection) on the image itself
- Remove the glassmorphic pill overlays from the image entirely

## File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

### `SceneCard` component (lines 178–231)

1. **Remove** the two `absolute bottom-1.5` overlay divs for background and aesthetic color pills from inside the image area (lines 202–224)
2. **Update bottom content area** (lines 226–229):
   - Remove subtitle `<p>` line
   - Center the title: `text-center`
   - Add a new row below title for color indicators:
     - If `hasBackground`: render background color dots (white, sage, blush, gradient) centered
     - If `hasAestheticColor`: render aesthetic color dots (suggested or defaults) centered, with small paintbrush icon
     - If neither: render a subtle neutral indicator (small `Camera` icon in muted color) to maintain consistent card height
   - Fixed min-height on content area (`min-h-[48px]`) to keep all cards uniform

### Visual result
```
┌──────────────┐
│              │
│  [preview]   │  ← clean image, only checkmark overlay
│              │
├──────────────┤
│  Scene Title │  ← centered, semibold
│   ● ● ● ●   │  ← color dots OR neutral icon
└──────────────┘
```

No other files need changes.

