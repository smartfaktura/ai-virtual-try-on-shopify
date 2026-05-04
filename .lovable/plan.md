
## Problem

Several categories have incomplete or awkward spec fields:
- **Shoes/Sneakers**: Only EU size, missing shoe height and width type (narrow/regular/wide)
- **Furniture**: Generic W/D/H only, no furniture type context (chair vs sofa vs table)
- **Jewelry necklaces/bracelets**: Chain length is a fixed dropdown instead of free input with unit choice
- **Unit toggle**: Already exists as cm/in but some categories (footwear, jewelry) don't benefit from it

## Changes

### 1. `src/lib/productSpecFields.ts` -- Field definitions

**Footwear** (sneakers, shoes, boots, high-heels):
- Remove `EU Size` from all footwear (not relevant to visual scale)
- Add `Height` input (shoe height in cm/in) to sneakers, shoes, boots
- Add `Width Profile` dropdown: `Narrow, Regular, Wide` to shoes/sneakers
- Keep `Shaft` for boots, keep `Heel Height` for shoes/boots/high-heels
- Add `Height` to high-heels (total shoe height)

**Furniture**:
- Add `Type` dropdown: `Chair, Armchair, Sofa, Coffee Table, Dining Table, Desk, Shelf, Cabinet, Bed, Bench, Stool, Other`
- Keep W/D/H inputs (already good)
- Add `Seat Height` input (cm/in) -- relevant for chairs/stools

**Jewelry -- Necklaces**:
- Change `Chain Length` from dropdown to input field with placeholder `45` / `18` (cm/in)
- Add `Pendant Thickness` input (mm)
- Keep `Pendant Size`

**Jewelry -- Bracelets**:
- Change `Length` from dropdown to input with placeholder `18` / `7` (cm/in)

**Jewelry -- Rings**:
- Add `Stone Size` input (mm) for visual scale reference

### 2. `src/lib/productSpecFields.ts` -- Unit handling

- Ensure all new cm-based fields have `placeholderImperial` values
- The existing `getDisplayUnit` and `unitSystem` toggle in ProductSpecsCard already handles the rest -- no UI changes needed

### Files to edit
- `src/lib/productSpecFields.ts` -- update field definitions for footwear, furniture, jewelry categories
