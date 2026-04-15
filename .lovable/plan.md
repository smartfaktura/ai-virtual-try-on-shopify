

# Save Image Optimization Rule as Project Memory

No code changes needed — just persist the rule so it's always followed.

## Memory to save: `mem://style/image-optimization-no-crop`

**Content**: For all full-bleed, carousel, and background images, use quality-only optimization (`{ quality: 60 }`). Never add a `width` parameter to `getOptimizedUrl` for these use cases — Supabase's `/render/image/` endpoint crops server-side when width is set without height, producing a zoomed-in result. The `width` parameter is only safe for small fixed-size thumbnails (product chips, avatars) where the container dimensions are known and match.

## Index update

Add to Core rules:
`Image optimization: quality-only for backgrounds/carousels. Never use width param — causes server-side crop zoom.`

Add to Memories:
`- [Image Optimization No-Crop](mem://style/image-optimization-no-crop) — Quality-only for full-bleed images, width only for fixed thumbnails`

## Files
- `mem://style/image-optimization-no-crop` (new)
- `mem://index.md` (update)

