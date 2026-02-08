
# Fix Edit Product: Show Existing Product Data Instead of Blank Form

## Problem

Clicking the "Edit" (pencil) button on any product opens the same blank "Add Product" modal. It should open with the product's existing data pre-filled so users can edit the name, type, description, and manage images.

## Solution

Add an edit mode to the existing modal flow. When a user clicks "Edit", the modal opens pre-populated with the product's current data and existing images loaded from the database.

## Changes

### 1. Products.tsx -- Track which product is being edited

- Add an `editingProduct` state (`UserProduct | null`) alongside the existing `modalOpen` state
- When the Edit button is clicked, set `editingProduct` to that product and open the modal
- When the Add button is clicked, set `editingProduct` to null and open the modal
- Pass `editingProduct` to `AddProductModal`
- On modal close, clear `editingProduct`

### 2. AddProductModal.tsx -- Support edit mode

- Accept an optional `editingProduct` prop
- Change the dialog title dynamically: "Edit Product" vs "Add Product"
- When in edit mode, hide the tabs (Store URL, CSV, Mobile don't apply to editing) and show only the manual form
- Pass the `editingProduct` data down to `ManualProductTab`

### 3. ManualProductTab.tsx -- Pre-fill fields and update instead of insert

- Accept an optional `editingProduct` prop
- When `editingProduct` is provided:
  - Pre-fill `title`, `productType`, and `description` from the product data
  - Fetch existing images from the `product_images` table for that product and load them into the gallery (as existing images without `File` objects)
  - Also include the product's primary `image_url` even if no rows exist in `product_images`
- On save when editing:
  - UPDATE the `user_products` row instead of INSERT
  - Delete removed images from `product_images` (and optionally from storage)
  - Insert newly added images into `product_images`
  - Update the primary `image_url` on `user_products` if the primary selection changed
- Change the submit button text from "Add Product" to "Save Changes"

### 4. ProductImageGallery.tsx -- Handle existing images (no File object)

- The `ImageItem.file` field is already optional (`file?: File`), so existing images loaded from the database (which only have a URL, no File) are already supported
- No changes needed to this component

## Technical Details

### Products.tsx

```text
// New state
const [editingProduct, setEditingProduct] = useState<UserProduct | null>(null);

// Edit button handler (grid and list views)
onClick={() => { setEditingProduct(product); setModalOpen(true); }}

// Add button handler  
onClick={() => { setEditingProduct(null); setModalOpen(true); }}

// Modal close handler
onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingProduct(null); }}

// Pass to modal
<AddProductModal editingProduct={editingProduct} ... />
```

### AddProductModal.tsx

```text
// New prop
editingProduct?: UserProduct | null;

// Dynamic title
<DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>

// Conditional rendering
if editingProduct:
  - Render ManualProductTab directly (no Tabs wrapper)
  - Pass editingProduct to ManualProductTab
else:
  - Render existing Tabs UI unchanged
```

### ManualProductTab.tsx

```text
// New prop  
editingProduct?: UserProduct | null;

// Pre-fill on mount (useEffect)
useEffect(() => {
  if (editingProduct) {
    setTitle(editingProduct.title);
    setProductType(editingProduct.product_type);
    setDescription(editingProduct.description);
    // Fetch existing images from product_images table
    loadExistingImages(editingProduct.id);
  }
}, [editingProduct]);

// New async function to load existing images
async function loadExistingImages(productId) {
  - Query product_images where product_id = productId, ordered by position
  - If no rows found, fall back to creating a single image item from editingProduct.image_url
  - Map rows to ImageItem[] with isPrimary = (position === 0)
  - Set images state
}

// Save handler branches
if editingProduct:
  - Upload only NEW images (those with a File object)
  - Delete removed images (compare initial IDs vs current IDs)
  - UPDATE user_products row
  - Update product_images table (delete removed, insert new, update positions)
else:
  - Existing INSERT logic (unchanged)
```

### UserProduct interface

The `UserProduct` interface is already defined in `Products.tsx`. It will be passed through the components as-is -- no changes needed to the interface.
