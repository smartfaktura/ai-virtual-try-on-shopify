

# Show Real Aspect Ratios + Add Preview Lightbox on Results Page

## Problem
1. All result images are forced to `aspect-square object-cover`, cropping non-square outputs
2. No way to open a full-screen preview of individual images

## Changes — `src/pages/TextToProduct.tsx`

### 1. Remove forced square aspect ratio
Replace `aspect-square object-cover` with `w-full object-contain` (or `object-cover` with a natural aspect container) on all result `<img>` tags so images display at their actual proportions.

### 2. Add lightbox state
Add state for the lightbox:
```typescript
const [lightboxOpen, setLightboxOpen] = useState(false);
const [lightboxIndex, setLightboxIndex] = useState(0);
const [lightboxImages, setLightboxImages] = useState<{url: string; label: string}[]>([]);
```

### 3. Wire up click-to-preview
When clicking an image card (not the download button), open `ImageLightbox` with the current group's images and index. Pass `onDownload` to enable downloading from the lightbox.

### 4. Render ImageLightbox
Import and render `ImageLightbox` at the bottom of the results section, passing `lightboxImages.map(i => i.url)` as the `images` prop.

### 5. Both result grids updated
Apply changes to both the multi-product grouped grid and the single-product grid.

## File
| File | Change |
|------|--------|
| `src/pages/TextToProduct.tsx` | Remove forced square, add lightbox state + component |

