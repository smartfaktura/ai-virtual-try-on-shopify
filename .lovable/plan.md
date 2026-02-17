

## Fix: Lightbox Performance and Action Buttons

### Problem 1: Thumbnail strip loads all images
The thumbnail strip at the bottom renders every single image (40+), each fetching a separate optimized URL. This causes significant lag when opening the lightbox.

### Problem 2: Missing action buttons
The Freestyle lightbox only passes `onDownload`. It lacks Delete, Copy Prompt, and other useful actions that are available on the gallery cards.

---

### Changes

**File: `src/components/app/ImageLightbox.tsx`**

1. **Remove the thumbnail strip entirely** -- it loads all images and causes the slowness. Navigation via left/right arrows and keyboard is sufficient and much faster.

2. **Add new action props** -- accept `onDelete` and `onCopyPrompt` callbacks so Freestyle can wire them up.

3. **Add action buttons to the bottom bar**:
   - Download (already exists)
   - Delete (trash icon)
   - Copy Prompt (clipboard icon)
   - Keep existing Select/Regenerate buttons for other consumers (Generate page)

Updated interface:
```tsx
interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onSelect?: (index: number) => void;
  onRegenerate?: (index: number) => void;
  onDownload?: (index: number) => void;
  onDelete?: (index: number) => void;
  onCopyPrompt?: (index: number) => void;
  selectedIndices?: Set<number>;
  productName?: string;
}
```

Remove the entire thumbnail strip section (lines 148-166) to eliminate the performance bottleneck.

Add Delete and Copy Prompt buttons to the bottom action bar alongside existing Download button.

**File: `src/pages/Freestyle.tsx`**

Wire up the new callbacks to the ImageLightbox:
```tsx
<ImageLightbox
  images={savedImages.map(i => i.url)}
  currentIndex={lightboxIndex}
  open={lightboxOpen}
  onClose={() => setLightboxOpen(false)}
  onNavigate={setLightboxIndex}
  onDownload={(idx) => handleDownload(savedImages[idx].url, idx)}
  onDelete={(idx) => {
    handleDelete(savedImages[idx].id);
    setLightboxOpen(false);
  }}
  onCopyPrompt={(idx) => {
    setPrompt(savedImages[idx].prompt);
    setLightboxOpen(false);
    toast.success('Prompt copied to editor');
  }}
/>
```

### Result
- Lightbox opens instantly -- no more loading 40+ thumbnails
- Users navigate with arrows (click or keyboard)
- Download, Delete, and Copy Prompt actions are accessible directly from the lightbox
- Other lightbox consumers (Generate, Jobs, Drops) are unaffected -- they don't pass the new optional props

### Files Modified
- `src/components/app/ImageLightbox.tsx` -- remove thumbnail strip, add Delete/Copy Prompt buttons
- `src/pages/Freestyle.tsx` -- wire up onDelete and onCopyPrompt to lightbox
