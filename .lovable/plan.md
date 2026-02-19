

## Compact Add Product Form -- Fit Everything on One Screen

### Problem

The current Upload tab in the Add Product modal requires scrolling to reach the Description and Dimensions fields. Users don't realize those fields exist, so they often go unfilled.

### Solution

Make the form more compact so all fields (image drop zone, product name, product type, description, dimensions) are visible without scrolling in the modal's viewport.

### Changes (single file: `src/components/app/ManualProductTab.tsx`)

**1. Reduce vertical spacing**
- Change the outer container from `space-y-4 sm:space-y-6` to `space-y-3 sm:space-y-4`
- Change the product details section from `space-y-3` to `space-y-2`

**2. Shrink the empty drop zone**
- Reduce padding from `py-7 sm:py-10` to `py-5 sm:py-6`
- Make the icon circle smaller (w-8 h-8 instead of w-10 h-10, icon w-4 h-4 instead of w-5 h-5)

**3. Put Product Name and Product Type side by side**
- Wrap them in a 2-column grid: `grid grid-cols-1 sm:grid-cols-2 gap-3`
- Product Name takes the left column, Product Type input takes the right column
- The quick-type badges row sits below the grid, spanning full width

**4. Put Description and Dimensions side by side**
- Wrap them in a 2-column grid: `grid grid-cols-1 sm:grid-cols-2 gap-3`
- Description (left, textarea with rows=2) and Dimensions (right, single input)

**5. Reduce footer padding**
- Change `pt-3 sm:pt-6` to `pt-2 sm:pt-3`

### Result

All fields will be visible on screen without scrolling in the 680px-wide modal. On mobile, fields still stack vertically (single column) so nothing gets cramped.

