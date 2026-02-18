

## Improve Add Product Modal -- Design, CTA Visibility, CSV Template, and Naming

### Problems Identified
1. **CTA button not visible** -- The "Add Product" button is below the fold in the modal, users have to scroll to find it
2. **CSV has no template** -- Users must guess the correct column format; a downloadable template would prevent errors
3. **Tab says "Store URL"** -- Should be "Product URL" since it imports a single product page, not an entire store

### Changes

#### 1. Sticky Footer for CTA (ManualProductTab.tsx)
Move the action buttons (Cancel / Add Product) into a sticky footer that's always visible at the bottom of the modal, regardless of scroll position. This ensures the CTA is never hidden.

- Wrap the form fields in a scrollable area
- Make the footer `sticky bottom-0` with a subtle top border and background blur
- Same treatment for StoreImportTab and CsvImportTab footers for consistency

#### 2. Rename "Store URL" to "Product URL" (AddProductModal.tsx)
- Change the tab label from "Store URL" to "Product URL"
- Update the icon if needed (keep Globe, it fits)

#### 3. CSV Downloadable Template (CsvImportTab.tsx)
- Add a "Download Template" button/link below the dropzone
- Generate a CSV file with the correct headers: `title, product_type, image_url, description`
- Include 2 example rows so users understand the expected format
- Use a simple `Blob` download -- no backend needed

#### 4. Modal Layout Polish (AddProductModal.tsx)
- Restructure the modal so the tab content area scrolls independently while the header and footer remain fixed
- This prevents the entire modal from scrolling and losing the tabs/CTA

### Files Modified
- `src/components/app/AddProductModal.tsx` -- sticky layout structure, rename tab
- `src/components/app/ManualProductTab.tsx` -- sticky footer for action buttons
- `src/components/app/CsvImportTab.tsx` -- add download template button
- `src/components/app/StoreImportTab.tsx` -- consistent sticky footer

