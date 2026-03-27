

# Fix Product Toggle in Submit to Discover Modal

## Problem
The product toggle only appears when `productName` AND `productImageUrl` are already attached to the generation. If the image wasn't created with a product, the toggle is hidden entirely — users have no way to attach a product from their library.

## Solution
Always show a "Product" section in the modal. If no product is pre-attached, let the user pick one from their `user_products` library via a dropdown. If a product IS pre-attached, show it with a toggle to include/exclude it.

## Changes

### `src/components/app/SubmitToDiscoverModal.tsx`

1. **Add product library query** — fetch user's products from `user_products` table (id, title, image_url), same pattern as admin modal
2. **Replace the conditional `hasProduct` block** with an always-visible "Product (optional)" section:
   - If products exist in library, show a `<Select>` dropdown with thumbnail + name for each product, plus a "None" option
   - If a product was pre-attached via props, pre-select it
   - When a product is selected, show preview card (thumbnail + name) with the existing Package icon style
3. **Update state** — replace `showProduct` boolean with `selectedProductId` state. Derive `finalProductName` / `finalProductImageUrl` from the selected product
4. **Keep submit logic** — still calls `generate-discover-preview` when a product is selected, same as before
5. **Ensure modal fits screen** — the modal already has `max-h-[90vh] overflow-y-auto`, which handles long content. Reduce image preview height from `max-h-48` to `max-h-36` to save vertical space

