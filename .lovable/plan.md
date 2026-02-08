

## Add "Upload Image" Label and "Add Product" Chip to Freestyle Prompt Bar

Two changes to the freestyle prompt panel's settings chips row:

---

### Change 1: Show "Upload Image" text on the Upload button

Currently the upload button only shows "+ Upload" (with "Upload" hidden on small screens). Update the label to read **"Upload Image"** and keep it visible at all sizes.

**File**: `src/components/app/freestyle/FreestylePromptPanel.tsx`
- Change the upload button label from `Upload` to `Upload Image`
- Remove `hidden sm:inline` so the text is always visible

---

### Change 2: Add "Add Product" chip to select from user's products

Add a new chip button in the settings row that opens a popover with the user's saved products (from the `user_products` table). When a product is selected, its image is loaded as the source image reference for generation.

**Files to create/modify**:

| File | Change |
|------|--------|
| `src/components/app/freestyle/ProductSelectorChip.tsx` | **New file.** A chip component styled identically to Model/Scene chips. Opens a popover that fetches `user_products` for the current user. Shows a scrollable list with product thumbnails, titles, and product types. If no products exist, shows "No products yet" with a link to the Products page. On select, calls `onSelect(product)` callback. |
| `src/components/app/freestyle/FreestyleSettingsChips.tsx` | Add the ProductSelectorChip between the Upload button and Model chip. Pass through new props: `selectedProduct`, `onProductSelect`, `productPopoverOpen`, `onProductPopoverChange`. |
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Thread the new product-related props through to FreestyleSettingsChips. |
| `src/pages/Freestyle.tsx` | Add state for `selectedProduct` and its popover. Fetch user products with `useQuery` from `user_products`. When a product is selected, convert its `image_url` to base64 and set it as the source image (same as manual upload). Wire all props to the prompt panel. |

### Product Selector Chip Behavior

- Chip label: "Add Product" (with a Package icon) when nothing selected
- When a product is selected: shows product thumbnail + title, with an X to deselect
- Popover contents: search input + scrollable grid of user products (image + title + type)
- Empty state: "No products yet" message with a button/link to `/app/products`
- Selecting a product automatically sets it as the source image for generation
- Deselecting clears the source image (if it was set by the product selector)

### Data Flow

```text
user_products table --> useQuery fetch --> ProductSelectorChip popover
  --> user selects product --> product.image_url set as sourceImage
  --> image sent to generate-freestyle edge function as reference
```

No backend or database changes needed -- the `user_products` table already exists with RLS policies in place.

