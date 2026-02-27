

## Remove "Brand" Step from Interior/Exterior Staging Wizard

### Problem
The wizard stepper for Interior/Exterior Staging shows: **Type > Upload Photo > Brand > Style > Results**. The "Brand" step doesn't make sense for room staging workflows -- brand profiles are designed for product photography (tone, colors, target audience), not room redesign.

### Solution
Remove "Brand" from the interior design stepper and skip the brand-profile step entirely for this workflow.

### Changes

**File: `src/pages/Generate.tsx`**

1. **Update stepper labels (line 864)**: Change from `['Type', 'Upload Photo', 'Brand', 'Style', 'Results']` to `['Type', 'Upload Photo', 'Style', 'Results']` -- removing the Brand step.

2. **Update step number mapping (line 816)**: Adjust the interior design step map to remove `brand-profile` and shift numbers:
   - `source: 1, upload: 2, settings: 3, generating: 4, results: 4`

3. **Skip brand-profile navigation for interior design (line 1253-1254)**: When `isInteriorDesign` is true after uploading, go directly to `'settings'` step instead of `'brand-profile'`.

### Files to Edit

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Remove Brand from interior stepper, skip brand-profile step for interior workflow |

