
## Problem

Current implementation uses plain text inputs and clickable chips — messy UX. Needs proper dropdown selects for each field, tailored per product category.

## Changes

### 1. `src/lib/productSpecFields.ts` — Redesign with dropdown options

Replace `DimensionGuide` with `SpecField` interface:

```
interface SpecField {
  key: string;          // unique field ID
  label: string;        // "Size", "Fit", "Material"
  type: 'select' | 'input';
  options?: string[];   // dropdown options (for type=select)
  placeholder?: string; // for type=input
  unit?: string;        // suffix like "cm", "mm"
}
```

Each category gets a `SpecField[]` with a mix of selects and inputs. Examples:

**Garments** — Size (select: XS/S/M/L/XL/XXL), Fit (select: Slim/Regular/Relaxed/Oversized), Length (select: Cropped/Mid-thigh/Knee/Full), Fabric (select: Cotton/Linen/Silk/Polyester/Wool/Blend)

**Jeans** — Waist (input: "32"), Length (input: "32"), Fit (select: Skinny/Slim/Straight/Regular/Wide-leg/Bootcut), Rise (select: Low/Mid/High), Fabric (select: Rigid denim/Stretch denim/Raw denim)

**Dresses** — Size (select), Silhouette (select: A-line/Bodycon/Wrap/Shift/Maxi/Mini), Fabric (select)

**Sneakers** — EU Size (input), Sole (select: Flat/Chunky/Platform), Profile (select: Low-top/Mid-top/High-top), Upper (select: Mesh/Leather/Suede/Canvas/Knit)

**Boots** — EU Size (input), Shaft (select: Ankle/Mid-calf/Knee-high), Heel Height (input + cm), Heel Type (select: Flat/Block/Stiletto/Wedge), Material (select: Leather/Suede/Synthetic)

**Bags** — Width (input+cm), Height (input+cm), Depth (input+cm), Material (select: Leather/Canvas/Nylon/Vegan leather), Hardware (select: Gold/Silver/Gunmetal/None)

**Watches** — Case (input+mm), Band Width (input+mm), Case Material (select: Steel/Titanium/Gold/Ceramic), Band (select: Leather/Metal mesh/Rubber/NATO)

**Jewelry (each type)** — Dimensions (input), Metal (select: Gold/Silver/Rose gold/Platinum), Stone (select: Diamond/Pearl/Crystal/Ruby/Sapphire/None)

**Eyewear** — Lens (input+mm), Frame (select: Acetate/Metal/Titanium/Wood), Lens Type (select: Clear/Gradient/Polarized/Mirror)

**Fragrance** — Volume (select: 30ml/50ml/75ml/100ml), Bottle Shape (select: Rectangular/Round/Oval/Square), Cap (select: Gold/Silver/Rose gold/Matte black/Clear)

**Beauty/Skincare** — Volume (select: 15ml/30ml/50ml/100ml), Container (select: Pump/Dropper/Tube/Jar/Spray), Material (select: Glass/Frosted glass/Plastic/Aluminum)

**Food** — Weight (input), Packaging (select: Box/Bag/Jar/Can/Pouch), Material (select: Kraft/Cardboard/Glass/Tin/Plastic)

**Furniture** — Width (input+cm), Depth (input+cm), Height (input+cm), Material (select: Oak/Walnut/Pine/Metal/MDF), Finish (select: Matte/Glossy/Natural/Painted)

**Tech** — Screen (input), Weight (input+g), Body (select: Aluminum/Glass/Plastic/Carbon fiber), Color (input)

...and all other categories follow the same pattern.

Remove `extras` array entirely — no more chips.

### 2. `src/components/app/product-images/ProductSpecsCard.tsx` — Dropdown UI

Replace the current grid of `Input` + chips with:
- Each `SpecField` renders as either a `Select` dropdown (with `SelectTrigger`/`SelectContent`/`SelectItem`) or a compact `Input` with optional unit suffix
- Fields laid out in a responsive 2-col grid (3-col on wider screens)
- Keep: accordion per product, Save button, collapsed summary, scrollable list, additional notes textarea
- Remove: all chip/extras logic

The `Select` triggers use `h-8 text-xs` sizing to stay compact. Empty selects show placeholder text.

### 3. Serialization stays the same

`serializeSpec` builds "Label: value, Label: value" string. `parseSpec` extracts values back. The flat string flows into `productSpecs` and the prompt builder unchanged.
