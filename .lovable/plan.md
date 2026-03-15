

## Replace "Bright Countertop" Scene Image (Cache-Bust)

The previous upload replaced the file in-place at `showcase/food-bread-bakery.jpg`, but the browser/CDN is serving the cached old version. The fix: upload the new image under a new filename and update the code reference.

### Steps

1. **Upload new image to storage** — Upload `user-uploads://freestyle-1_30.png` to the `landing-assets` bucket at a new path: `showcase/food-bread-countertop.png`

2. **Update reference in `src/data/mockData.ts`** (line 1241):
   - Change `showcase/food-bread-bakery.jpg` → `showcase/food-bread-countertop.png`

This busts the CDN/browser cache since it's a new URL. One file change + one storage upload.

