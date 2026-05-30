## Objective
Increase border-radius across three video creation UI elements to achieve a softer, more consistent pill-and-card aesthetic.

## Changes

### 1. Upsell row — MotionRefinementPanel.tsx (lines 101–113)
- Container: `rounded-lg` → `rounded-full`. Reduce vertical padding to `py-1.5` so the pill stays compact.
- "Upgrade" button: replace plain underlined text with a pill button — `rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/15`.

### 2. Camera-motion tiles — CameraMotionGrid.tsx (line 94)
- Tile border-radius: `rounded-xl` → `rounded-2xl`.

### 3. Credit cost bar — CreditEstimateBox.tsx (line 13)
- Container: `rounded-lg` → `rounded-full`. Bump horizontal padding to `px-3.5` for balanced pill proportions.

## Notes
- No logic, props, or state changes.
- Purely visual rounding and spacing adjustments.
- All values use Tailwind utility classes and existing semantic tokens.