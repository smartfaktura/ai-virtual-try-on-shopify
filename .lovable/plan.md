## Audit result

The 5 Product Swap carousel images live in `/public/images/product-swap/` and are served as-is — `getOptimizedUrl()` only transforms Supabase Storage URLs, so local files bypass it entirely.

Current sizes:

| File | Dims | Weight |
|---|---|---|
| scene-1.jpg | 1546×1920 | 733 KB |
| scene-2.jpg | 1546×1920 | 720 KB |
| scene-3.jpg | 1546×1920 | 742 KB |
| scene-4.jpg | 1546×1920 | 766 KB |
| scene-5.jpg | 1546×1920 | 741 KB |
| **Total** | | **~3.65 MB** |

The carousel preloads next-2 frames and the card is only ~460px wide on desktop (≤920px at 2× DPR), so we're shipping ~3.5MB of unnecessary pixels for a small thumbnail.

## Fix

Re-encode the 5 JPGs in place via ImageMagick:
- Resize to **1024px wide** (still 2× the largest rendered size for retina)
- Quality **78**, progressive JPEG, strip metadata
- Expected output: **~110–160 KB each**, ~700 KB total — roughly an **80% reduction**

No code changes needed; the file paths and carousel logic stay the same.

### Verification
- After re-encoding, list new file sizes and confirm thumbnail still looks crisp at the card size in the preview.

Scope: 5 files in `public/images/product-swap/`. No source code changes.