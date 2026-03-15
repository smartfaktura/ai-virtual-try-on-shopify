

## Route Product Perspectives to Standalone Page

### Problem
The Product Perspectives workflow currently goes through the generic Generate page (`/app/generate?workflow=...`) which uses a multi-step flow. The standalone `/app/perspectives` page has a better single-page layout with all sections visible at once (source, perspectives, ratios + sticky bottom bar). The user wants to use that layout instead.

### Changes

#### `src/pages/Workflows.tsx`
- In `handleCreateVisualSet`, detect when workflow name is `'Product Perspectives'` and navigate to `/app/perspectives` instead of `/app/generate?workflow=...`

#### `src/pages/Generate.tsx`  
- Add a redirect: if the URL has a workflow query param that resolves to the Product Perspectives workflow (angle type), redirect to `/app/perspectives`
- This ensures any deep links or bookmarks still work

#### Cleanup
- Remove the angle-workflow-specific code from Generate.tsx (the `isAngleWorkflow` branches, library picker for angle workflow, step mapping) since it's no longer needed there — keeps Generate.tsx cleaner

This is a small routing change — the standalone Perspectives page already has all the functionality (3 source types, library picker, product picker, upload, angle checkboxes with reference uploads, multi-ratio, sticky generate bar).

