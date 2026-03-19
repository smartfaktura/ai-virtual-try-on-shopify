

# Fix Workflow Thumbnail Images in Creative Drops Wizard

## Problem
On step 3/5 (workflow selection), workflow thumbnail images appear zoomed in and may show incorrect/generic images. The `preview_image_url` from the database takes priority over the curated fallback images, and `object-cover` crops them.

## Fix

**File: `src/components/app/CreativeDropWizard.tsx`**

### 1. Prioritize curated fallback images over DB preview_image_url
The `WORKFLOW_FALLBACK_IMAGES` map (lines 40-47) has hand-picked images for each workflow. Change the image source logic to prefer fallbacks when available:

- **Line 791** (workflow selection list): Change from `wf.preview_image_url || WORKFLOW_FALLBACK_IMAGES[wf.name]` to `WORKFLOW_FALLBACK_IMAGES[wf.name] || wf.preview_image_url`
- **Line 883** (config step header): Same change

### 2. Change object-cover to object-contain on workflow thumbnails
Prevent zooming/cropping:

- **Line 791**: `object-cover` → `object-contain`
- **Line 883**: `object-cover` → `object-contain`

These are small `w-14 h-14` and `w-12 h-12` thumbnails next to workflow names — `object-contain` will show the full image within the square.

