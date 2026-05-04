## Problem

The Product Details fields are bloated with material, finish, hardware, and style dropdowns that don't serve the core purpose: telling the AI the **physical scale** of the product so it renders at the correct size relative to a person and environment.

Material, finish, and style are already visible from the product image — the AI detects those automatically.

## Solution

Strip every category down to **only dimension/size fields** — the inputs that communicate physical scale. Remove all material, finish, hardware, style, metal, stone, frame, body, container, packaging dropdowns.

### What stays per category

**Apparel**: Size + Fit (these affect how garments drape on a body — relevant to scale)
**Dresses**: Size + Length (mini vs maxi = huge visual difference)
**Jeans**: Waist + Length + Fit
**Jackets**: Size + Length
**Hoodies/Activewear/Swimwear/Lingerie/Kidswear**: Size only
**Footwear (all)**: EU Size only (+ Heel Height for heels/boots)
**Bags/Backpacks**: W × H × D dimensions
**Wallets**: W × H
**Belts/Scarves**: Length × Width
**Hats**: just a note field (one-size)
**Eyewear**: Lens Width + Bridge + Temple (standard frame sizing)
**Watches**: Case diameter
**Jewelry**: Chain length / Ring size / Bracelet length / Drop length — these define how it sits on a body
**Fragrance/Beauty/Makeup**: Volume + Height (bottle scale)
**Food**: Weight + Package Size
**Beverages**: Volume
**Home Decor/Furniture**: W × H × D
**Tech**: Dimensions (freeform like "14.6×7.1×0.8cm")
**Supplements**: Container Height
**Pet Accessories**: Length × Width
**Default (other)**: W × H × D

### Files changed

**`src/lib/productSpecFields.ts`** — Rewrite all CATEGORY_FIELDS entries to dimension-only fields. Remove material/finish/hardware/style/metal/stone/frame/body/container/packaging selects. Keep the file structure, exports, and helper functions identical.
