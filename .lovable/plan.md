

# My Brand Models — Redesign & Freestyle Integration Fix

## Changes

### 1. Redesign `BrandModels.tsx` → "My Brand Models"
- Rename page title to **"My Brand Models"**
- Update subtitle to match VOVV.AI luxury aesthetic
- Improve upgrade hero with better visual hierarchy and breathing whitespace
- **Reference tab**: Add a T&C checkbox before generate button — "I confirm I own the rights to this image or have permission to use it as a reference. I accept full responsibility for the content I upload."
- Checkbox must be checked to enable the Generate button
- Better card design for model grid with refined spacing

### 2. Freestyle ModelSelectorChip — Move "Create Your Model" to last position
- Move the "Create Your Model" button from **above** the model grid to **below** it (as the last card in the grid)
- Render it as a card matching model card dimensions (not a standalone button)
- If plan is lower than Growth: show card as **inactive/dimmed** with "Growth Plan" badge and a hook line like "Create your own brand model"
- If paid: show active card linking to `/app/models`

### 3. Sidebar label update
- Change sidebar label from "Models" to **"Brand Models"** (or keep compact as "Models" if collapsed)

## Files changed

| File | Change |
|------|--------|
| `src/pages/BrandModels.tsx` | Rename to "My Brand Models", add T&C checkbox on reference tab, design polish |
| `src/components/app/freestyle/ModelSelectorChip.tsx` | Move "Create Your Model" from top to last card in grid, inactive state for free users |
| `src/components/app/AppShell.tsx` | Update nav label to "Brand Models" |

