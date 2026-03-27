

# Add Search to Admin Product Selector in Discover Detail Modal

## Problem
The product dropdown in the admin Discover detail modal uses a basic `<Select>` with no search. With many products, finding the right one is tedious (as shown in the screenshot).

## Solution
Replace the Radix `<Select>` with a `<Popover>` + `<Input>` + filtered list pattern, similar to a combobox. This allows typing to filter products by name.

## Changes in `src/components/app/DiscoverDetailModal.tsx`

1. **Replace `<Select>` with `<Popover>`** containing:
   - A trigger button showing the current selection (product thumbnail + name, "None", or "Custom")
   - A popover content with a search `<Input>` at the top
   - A scrollable list of products filtered by the search term
   - "None" and "Custom" options at the top before the product list

2. **Add `productSearch` state** to track the filter text

3. **Filter `myProducts`** by `title.toLowerCase().includes(search)` before rendering

4. **Keep all existing logic** for `editProductSource`, `editProductName`, `editProductImageUrl` unchanged — only the UI component changes

