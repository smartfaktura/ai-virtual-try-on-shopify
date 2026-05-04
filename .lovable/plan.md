
## Problem

1. Auto-save was added without request -- user wants a manual Save button instead.
2. The specs input is just a plain textarea -- needs structured dimension guide fields based on product category.

## Changes

### 1. `src/lib/productSpecFields.ts` -- Add structured dimension guides

Add a `CategoryGuide` interface and `getCategoryGuide(category)` function that returns per-category structured fields:

- **Furniture**: Width / Depth / Height (cm) + extras: Material, Finish, Seating
- **Garments/Dresses/Hoodies/Jeans/Jackets/Activewear/Swimwear/Lingerie/Kidswear**: Size + Length/Waist where relevant + extras: Fit, Fabric
- **Sneakers/Shoes/Boots/High-heels**: EU Size / US Size / Heel / Shaft Height + extras: Material, Sole, Colorway
- **Bags/Backpacks/Wallets**: Width / Height / Depth + extras: Strap, Volume, Material
- **Belts/Scarves/Hats**: Length / Width / Brim + extras: Material, Buckle
- **Watches**: Case / Band Width / Thickness (mm) + extras: Material
- **Jewelry (4 types)**: Chain / Drop / Band / Pendant sizes + extras: Metal, Stone
- **Eyewear**: Lens / Bridge / Temple (mm) + extras: Frame material
- **Fragrance/Beauty/Makeup**: Volume / Height / Weight + extras: Shape, Cap, Container
- **Food/Beverages**: Weight / Volume / Package size + extras: Packaging type
- **Home Decor/Tech/Supplements**: W/H/D or Screen/Weight + extras

Each guide has `dimensions: DimensionGuide[]` (label, placeholder, optional unit) and `extras: string[]` (hint chips).

### 2. `src/components/app/product-images/ProductSpecsCard.tsx` -- Full rewrite

**Remove auto-save entirely.** No debounce, no supabase import, no save status tracking.

**New UI per product (accordion):**
- Clickable header row: thumbnail + name + category label + filled/empty indicator + chevron
- Expanded content:
  - Row of small inline inputs for the category's dimension fields (e.g. "Width [___] cm", "Height [___] cm")
  - Below dimensions: hint chips showing the `extras` array as clickable suggestions that append to the notes textarea
  - A "Additional notes" textarea (3 rows, 500 char max) for anything else
  - Character counter `{len}/500`

**Save button:**
- A single "Save Details" button at the bottom of the expanded card (inside the card, below all products)
- On click: persists all specs to `user_products.dimensions` via supabase update, shows a toast on success
- Button shows a loading spinner while saving, disabled when nothing has changed

**Data shape stays the same:** `productSpecs: Record<string, string>` -- the structured inputs + notes textarea are concatenated into a single string when updating the parent state (e.g. "Width: 30cm, Height: 25cm, Depth: 12cm. Additional: ceramic, matte glaze").

**Other UX kept from previous version:**
- Collapsed summary: "2 of 3 products have details"
- Scrollable list: `max-h-[360px] overflow-y-auto`
- Per-product accordion (one open at a time)
- Amber border card styling

### 3. `src/pages/ProductImages.tsx` -- No changes needed

The existing fire-and-forget persist at generation time stays as a safety net. The Save button in the card handles explicit saves.
