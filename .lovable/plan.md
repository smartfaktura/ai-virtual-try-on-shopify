

## Fix Scene Preview Display and Remove End-User Tooltip

### Issue 1: Images appear zoomed/cropped

The scene preview images are displayed inside an `aspect-square` container with `object-cover`, which crops the images. Additionally, the `getOptimizedUrl` call uses `width: 400` which forces a low resolution that gets stretched.

**Fix in `src/pages/Generate.tsx` (line 1489-1491):**
- Remove the `width: 400` parameter from `getOptimizedUrl` -- keep only `quality: 60` for compression without resizing
- Change `object-cover` to `object-contain` so the full image is visible without cropping

### Issue 2: Tooltip showing scene description to all visitors

The `<Tooltip>` component wrapping each scene card shows `v.instruction` (the scene prompt description like "Product placed on a polished white marble slab...") on hover to ALL users. This should only be visible to admins.

**Fix in `src/pages/Generate.tsx` (lines 1458, 1467-1530):**
- Remove the `<TooltipProvider>`, `<Tooltip>`, `<TooltipTrigger>`, and `<TooltipContent>` wrappers for non-admin users
- Keep the tooltip only when `isAdmin` is true so the description is hidden from end users

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Remove width constraint from image optimization, change object-cover to object-contain, make tooltip admin-only |

