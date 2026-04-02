

# Fix Prop Picker Modal — Match Product Card Style

The prop picker modal shows product images with `object-contain`, causing tall/narrow product photos to appear as thin vertical stripes. The Products step uses `object-cover` with a padded card layout that looks much better.

## Changes

**File: `src/components/app/catalog/CatalogStepProps.tsx`** — Update the prop picker modal grid cards (lines 120-142) to match the Products step card style:

1. Change card styling from `p-2` flat layout to `rounded-2xl` with inner padding (`p-2.5 pb-0`) and a proper info section below
2. Change image from `object-contain` to `object-cover` so products fill the thumbnail properly
3. Add the inner `rounded-xl` image wrapper with `bg-muted/30` background
4. Move title/type text into a proper `px-3 py-2.5` info section with `line-clamp-2` instead of `truncate`
5. Add product type as a pill badge (`bg-muted/60 rounded-full px-2 py-0.5`) matching the Products step

This brings the prop picker visual treatment in line with how products appear in the selection grid.

