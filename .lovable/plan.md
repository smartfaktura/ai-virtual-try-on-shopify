

## Simplify Creative Drop Wizard -- Remove Theme Step

### Problem
The first step of the wizard currently includes a Theme selector (Spring, Summer, Autumn, etc.) that adds unnecessary complexity. The user wants a simpler first step with just the essentials.

### Changes

**File: `src/components/app/CreativeDropWizard.tsx`**

1. **Remove the Theme grid UI** (lines 491-513) -- delete the entire "Theme" section with the 9 theme buttons from step 0's render

2. **Rename step label** -- Change `STEPS` array from `['Theme', 'Products', 'Workflows', 'Schedule', 'Review']` to `['Details', 'Products', 'Workflows', 'Schedule', 'Review']` since the step now covers general details rather than theme selection

3. **Default theme to 'custom'** -- Keep the `theme` state defaulting to `'custom'` (already does this) so existing save logic and the edge function continue to work without changes. The theme field in the database payload will simply always be `'custom'`

4. **Remove the `THEMES` constant** (lines 66-76) -- no longer needed since the theme grid is removed

5. **Remove the `themeConfig` variable** (line 424) -- it references `THEMES` which will be removed

6. **Clean up Review step** -- If the review step displays the selected theme, update it to either skip showing theme or show "Custom" quietly. Will check and adjust accordingly.

No database changes needed. The `theme` column in `creative_schedules` will still receive `'custom'` as the default value.

### Result
Step 1 becomes a clean, focused form with three fields:
- Schedule Name (required)
- Brand Profile (optional dropdown)
- Special Instructions (optional textarea)

