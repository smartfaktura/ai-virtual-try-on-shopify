

# Fix "View All" Button & Preset Color Indicators

## 1. Improve "View all models" button

The current button sits too close to the model cards and looks like a generic outline button. Fix:

**File:** `ProductImagesStep3Refine.tsx` (lines 134-138)

- Add `mt-2` spacing above the button
- Change from `Button variant="outline"` to a subtle text-link style: `text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer py-2` with an underline on hover
- This creates clear visual separation and makes it feel like a "browse more" link rather than a competing action button

## 2. Redesign preset color indicators

The current `PresetColorDots` renders a thin 1px-wide vertical stripe that's nearly invisible. Replace with a more prominent, elegant swatch:

**File:** `ProductImagesStep3Refine.tsx` (lines 830-839)

- Replace the thin `w-1` stripe with a `w-5 h-5 rounded-md overflow-hidden` square that shows the 3 colors as horizontal bands (each taking 1/3 height)
- This creates a mini color swatch block that's clearly visible at a glance
- Update the preset button layout to accommodate the slightly larger swatch (keep `gap-2`)

## Files

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | (1) Restyle "View all" as a spaced text-link. (2) Redesign `PresetColorDots` to a visible color swatch square. |

