

## Product Perspectives — Implemented ✅

### What was built
A new **Product Perspectives** workflow that generates angle and detail variations (Close-up, Back, Left Side, Right Side, Wide/Environment) from existing product images.

### Key features
- **Multi-product support**: Select multiple products from library, each generates its own batch
- **Multi-ratio support**: Select multiple aspect ratios (1:1, 3:4, 4:5, 9:16)
- **Direct upload**: Upload a new image instead of picking from product library
- **Conditional reference uploads**: When "Back Angle" is selected, an upload zone appears for the user to optionally provide a back reference image for accuracy
- **Left/Right side optional references**: Available via "Add reference image" link
- **Credits**: 4 credits/image (standard), 8 credits/image (high quality)

### Files changed
- **Database migration**: Inserted "Product Perspectives" workflow row
- `src/pages/Perspectives.tsx` — Full page with product picker, angle checkboxes, ratio multi-select, conditional reference uploads
- `src/hooks/useGeneratePerspectives.ts` — Multi-product × multi-ratio × multi-angle batch enqueue
- `src/components/app/LibraryDetailModal.tsx` — Added "Generate Perspectives" button
- `src/App.tsx` — Added `/app/perspectives` route
