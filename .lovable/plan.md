

# Hide Scene Category Filters on Product Listing Set + Admin Sort Note

## Problem
The product-listing-set workflow shows many category filter tabs (All, Studio Essentials, Surface & Texture, etc.) which clutter the UI. The user wants them hidden for this workflow.

## Changes

### 1. Hide category filter tabs for product-listing-set (`src/components/app/generate/WorkflowSettingsPanel.tsx`)
- In the scene category filter section (around line 301), add a condition to skip rendering when the active workflow slug is `product-listing-set`
- Simple one-line check: `if (activeWorkflow?.slug === 'product-listing-set') return null;`
- This keeps filters available for other workflows (e.g., interior design) where they're useful

### 2. Admin sorting of scenes
The existing Scene Manager (`/app/admin/scenes`) already supports drag-and-drop reordering of scenes via the `scene_sort_order` table and `useSceneSortOrder` hook. This sort order is already applied to the product-listing-set scene grid (via `sortScenes()` in `Generate.tsx` line 440). So **admin sorting already works** — reordering scenes in the admin panel will change their order on this page too. No new code needed.

