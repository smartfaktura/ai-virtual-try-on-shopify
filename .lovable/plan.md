

## Fix scenes not loading on `/app/generate/selfie-ugc-set`

### Root cause
Workflow names in the database were shortened (e.g., "Selfie / UGC Set" → "Selfie / UGC"), but `src/pages/Generate.tsx` still detects these workflows by their **old display name strings**. Detection flags become `false`, so the UI takes the wrong branch and scenes/pickers don't render correctly.

DB vs code comparison:

| Slug | DB name | Code expects | Match? |
|---|---|---|---|
| `selfie-ugc-set` | `Selfie / UGC` | `Selfie / UGC Set` | ❌ |
| `mirror-selfie-set` | `Mirror Selfie` | `Mirror Selfie Set` | ❌ |
| `flat-lay-set` | `Flat Lay` | `Flat Lay Set` | ❌ |
| `product-listing-set` | `Product Listing` | (uses slug ✅) | ✅ |
| `interior-exterior-staging` | `Interior / Exterior Staging` | same | ✅ |
| `image-upscaling` | `Image Upscaling` | same | ✅ |

Effect on `/app/generate/selfie-ugc-set`:
- `isSelfieUgc` is `false`
- Scene picker, model-picker behavior, UGC mood selector, and credit math all fall back to the wrong branch → scenes don't load as intended

### Fix (single file: `src/pages/Generate.tsx`)

Switch all workflow detection from name-matching to **slug-matching** (which is stable):

```ts
const isSelfieUgc      = activeWorkflow?.slug === 'selfie-ugc-set';
const isMirrorSelfie   = activeWorkflow?.slug === 'mirror-selfie-set';
const isFlatLay        = activeWorkflow?.slug === 'flat-lay-set';
const isUpscale        = activeWorkflow?.slug === 'image-upscaling';
const isInteriorDesign = activeWorkflow?.slug === 'interior-exterior-staging';
```

Audit the file for any other `activeWorkflow?.name === '...'` checks and convert each to a slug check.

### Why slug, not renaming the DB
- Slugs are the route identifier and never change
- Renaming DB names back would break admin UI, learn content, and any analytics that reference current names
- One-line-per-flag change, zero schema impact

### Validation
1. Visit `/app/generate/selfie-ugc-set` → scene/pose UI for Selfie/UGC renders, mood selector appears
2. Visit `/app/generate/mirror-selfie-set` → mirror selfie phase flow works
3. Visit `/app/generate/flat-lay-set` → flat-lay surfaces/details phases render
4. Other workflows unaffected

### Files touched
- `src/pages/Generate.tsx` only. No DB, no other components.

