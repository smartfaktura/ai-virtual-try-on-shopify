

## Personalized Download Filenames

### Problem
Currently all downloaded images are named `generated-image-1.png`, `generated-image-2.png`, etc. After many generations and downloads, users cannot tell which file belongs to which product.

### Solution
Build descriptive filenames using available context: product name, workflow name, model name, and variation label.

**Format**: `{ProductName}_{WorkflowName}_{VariationLabel}_{index}.png`
- Example: `Green_Crop_Top_Virtual_Try-On_Mia_1.png`
- Example: `Leather_Bag_Product_Listing_White_Studio_3.png`
- Sanitize names (replace spaces with underscores, strip special chars, truncate to reasonable length)

### Changes — 2 files

**1. `src/pages/Generate.tsx`** — `handleDownloadImage` function (line ~1176)
- Replace `generated-image-${index + 1}.png` with a descriptive filename built from:
  - `selectedProduct?.title` or `scratchUpload?.productInfo.title` (product name)
  - `activeWorkflow?.name` (workflow name)
  - `selectedModel?.name` (model name, for try-on)
  - Variation label from `variationStrategy?.variations` mapped via `selectedVariationIndices`
- Also update `handleDownloadAll` to use the same naming

**2. `src/pages/Generate.tsx`** — Add a small helper function `buildFileName(index)` that:
  - Takes product name, workflow name, optional model name, optional variation label
  - Sanitizes each part (lowercase, replace spaces/special chars with underscores, max 30 chars per segment)
  - Returns e.g. `green_crop_top-virtual_try_on-mia-1.png`

All other download paths (Library, Creative Drops) already use `item.label` or `scene_name` which contain meaningful names.

