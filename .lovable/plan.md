

# Fix Zoomed-In Thumbnails After Optimization

## Problem
The `width: 400` optimization is too aggressive — at 2x retina the grid cards need ~600px of image data. Supabase serves a 400px image, then `object-cover` upscales and crops it to fill the 3:4 container, making it look zoomed in compared to the original.

## Fix — `src/pages/VideoHub.tsx`
Increase the optimization width from `400` to `800` (covers 2x retina for ~400px CSS-wide cards). This keeps the bandwidth savings (800px vs original 2048px+) while preventing the zoom/crop artifact.

Change in two places:
- Line 98 (video poster): `{ width: 400, quality: 50 }` → `{ width: 800, quality: 60 }`
- Line 109 (img src): `{ width: 400, quality: 50 }` → `{ width: 800, quality: 60 }`

Two-line change, same file.

