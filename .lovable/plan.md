

# Improve ZIP Image Naming and Folder Name

## Current behavior
- ZIP file named: `{productName}.zip`
- Images named: `image_1.jpg`, `image_2.jpg`, etc. (generic, no product context)

## New behavior
- **ZIP file name**: `2026-03-20-Virtual Try On Set (VOVV.AI).zip` — format: `{YYYY-MM-DD}-{workflowName} (VOVV.AI).zip`
- **Image file names**: `ProductName_1.jpg`, `ProductName_2.jpg` — using product name from `jobMetadata` or `workflowVariationLabels` to prefix each image with its product name

## Changes — `src/pages/Generate.tsx`

### 1. Update `handleDownloadZip` (lines ~1707-1719)
- Build ZIP folder name as `YYYY-MM-DD-WorkflowName (VOVV.AI)` using current date + `activeWorkflow?.name`
- For each image, derive product name from `workflowVariationLabels[index]` (which contains `ProductName — ratio · framing`) by extracting the part before ` — `, or fall back to the selected product title
- Name each file as `{productName}_{sequenceNumber}{ext}` (per-product counter so numbering restarts per product)

### Files
- `src/pages/Generate.tsx` only

