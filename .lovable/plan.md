

# Fix Product Grid Spacing, Upload Card Style & Behavior

## Problems Identified
1. **Grey background on upload card**: The upload card's image area uses `bg-muted/30`, creating a visible grey square that looks inconsistent with other cards.
2. **"Create from Product Image" opens file picker directly** instead of the AddProductModal (which has Upload, URL, CSV, Mobile, Shopify tabs). User wants it to match the "New" button behavior.
3. **Minor spacing inconsistency**: The upload card and product cards have slightly different visual weight due to the grey fill vs transparent product cards.

## Changes — `src/pages/ProductImages.tsx`

### 1. Replace Quick Upload card with simple "Add Product" card that opens modal
Replace the entire Quick Upload card (lines 1091-1138) with a simple button card matching the existing "Add New" card style (line 1169), but positioned first in the grid. It opens the existing `AddProductModal` (already wired at line 1180).

- Remove the quick upload logic (file input, drag/drop, `handleQuickUpload` call)
- Replace with a clean dashed-border card: Plus icon + "New" label + subtitle "Add product"
- On click: `setAddProductOpen(true)` — opens the full AddProductModal

### 2. Remove the duplicate "Add New" button at end of grid
Since the upload card at the start now opens the modal, remove the duplicate "Add New" button at line 1169-1172 to avoid redundancy.

### 3. Remove unused quick upload state/refs
Clean up `quickUploadInputRef`, `quickUploading`, `quickUploadProgress`, `isDragOver`, `handleQuickUpload` if they become unused (or keep if used elsewhere — will verify).

This gives a consistent look: one clean "New" card at the start of the grid that opens the full-featured AddProductModal with all import options.

