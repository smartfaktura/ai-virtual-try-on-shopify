## Changes

### 1. `src/components/app/product-images/ProductSpecsCard.tsx` — Inline unit toggles per field

Remove the separate "Unit cm/inches" row entirely. Instead, for each field:

- **Fields with `unit: 'cm'`** — replace the static "cm" / "in" text label with a small inline **cm | in** toggle (two mini buttons in a bordered pill) right next to the input. Clicking either button switches `unitSystem` for all cm fields. This puts the unit control exactly where the user sees the value.

- **Volume comboInput fields** — add a static "ml" label next to the input (volume presets already include "ml"/"L" in their text like "330ml", "1L"). The unit is embedded in the value itself.

- **Other units (mm, g)** — show as a static label next to the input (no toggle needed, these don't change).

- **Remove** the `showUnitToggle` variable and the entire `{showUnitToggle && (...)}` block.

- Only show the cm/in toggle on the **first** cm-unit field in the grid to avoid visual clutter (all others show the current unit as plain text since they're synced).

### 2. Remove unused `hasCmFields` helper

No longer needed since the toggle is inline per-field.
