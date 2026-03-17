

## Remove Redundant "Add Products" Button When Empty

### Problem
On the Products page with no products, there are two "Add Products" buttons visible — one in the top toolbar and one in the empty state card. This is redundant and clutters the UI, especially on mobile.

### Solution
Conditionally hide the top-bar "Add Products" button when the product list is empty (and not loading). The empty state card already provides the primary CTA.

### Changes

**`src/pages/Products.tsx`**

1. In the top bar section (~line 134), wrap the "Add Products" button with a condition:
   - Only show it when `products.length > 0` (i.e., the user has products)
   - This way, when the empty state is displayed, only its CTA is visible
   - Once the user has products, the top bar button reappears for quick access

Single-line change — the Button gets wrapped in `{products.length > 0 && ( ... )}`.

