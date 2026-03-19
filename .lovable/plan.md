

# Compact Product Grid in Creative Drops Wizard

## Problem
The product selection grid (step 2) uses large cards with `grid-cols-2 sm:grid-cols-3` and big `aspect-square` thumbnails. With many products, they don't fit and require excessive scrolling. The Workflows page uses a more compact layout.

## Fix

**File: `src/components/app/CreativeDropWizard.tsx`**

### Grid view (lines 667-696)
- Change grid from `grid-cols-2 sm:grid-cols-3` → `grid-cols-3 sm:grid-cols-4 md:grid-cols-5`
- Reduce card padding from `p-2` → `p-1.5`
- Reduce border radius from `rounded-2xl` → `rounded-xl`
- Reduce image corner radius from `rounded-xl` → `rounded-lg`
- Reduce margin below image from `mb-2` → `mb-1`
- Keep `aspect-square` but the smaller grid cells will naturally shrink the images

### Skeleton loading (lines 625-626)
- Match the new grid: `grid-cols-3 sm:grid-cols-4 md:grid-cols-5`

This matches the compact card density used in Workflow scene selection (`grid-cols-3 sm:grid-cols-4 lg:grid-cols-5`).

