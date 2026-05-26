### Goal
Append " · optional" to the label of 4 extras fields in the brand-scenes wizard so users understand these settings are not required.

### Files changed
- `src/features/brand-scenes/wizard/constants/extras.ts`

### Changes
Update the `label` property for these 4 entries in `CAST_EXTRAS_FIELDS`:

1. `skin_finish`: `"Skin finish"` → `"Skin finish · optional"`
2. `hair`: `"Hair styling"` → `"Hair styling · optional"`
3. `makeup`: `"Makeup"` → `"Makeup · optional"`
4. `storytelling_moment`: `"Storytelling moment"` → `"Storytelling moment · optional"`

These labels are rendered by `ExtrasPillField` via the `Section` component. No other logic changes are needed.