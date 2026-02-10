

## Fix Freestyle Generation Display Issues

### Problems Identified

1. **Generating cards disappear on re-render/navigation**: The `isLoading` and `progress` state live in `useGenerateFreestyle` hook (local React state). If the component re-mounts (navigation, hard refresh), the generating state is lost -- the cards vanish, then images pop in abruptly when saved.

2. **Images appear one-by-one with a "glitch"**: After generation completes, `handleGenerate` loops through `result.images` and calls `saveImage` sequentially. Each `saveImage` uploads to storage, inserts into DB, then prepends to `images` state -- causing images to pop in one at a time with layout shifts.

3. **Multi-image generation looks broken**: When generating multiple images, multiple `GeneratingCard` placeholders appear, then they all vanish at once (when `isLoading` flips to false), followed by images appearing one-by-one as each upload finishes.

### Solution

**A. Batch image saving to prevent staggered appearance:**

In `Freestyle.tsx`, change the post-generation flow from sequential `saveImage` calls to a batch approach:
- Upload and save all images in parallel using `Promise.all`
- Only update the images state once with all new images at the same time
- Add a new `saveImages` (plural) method to `useFreestyleImages` that handles batch inserts

**B. Smooth transition from generating to generated:**

In `FreestyleGallery.tsx`, add a brief fade-in transition when generating cards are replaced by real images so the swap feels smooth rather than abrupt.

**C. Keep generating state stable during the save phase:**

In `Freestyle.tsx`, don't immediately hide the generating cards when the API responds. Instead, keep them visible until all images are saved to DB, then swap them out. This prevents the "flash" where generating cards vanish but images haven't appeared yet.

### Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useFreestyleImages.ts` | Add `saveImages` (batch) method that uploads all images in parallel and updates state once |
| `src/pages/Freestyle.tsx` | Use batch save; keep `isLoading`-like state active until images are fully saved |
| `src/hooks/useGenerateFreestyle.ts` | Minor: don't flip `isLoading` to false in `finally` -- let caller control it |
| `src/components/app/freestyle/FreestyleGallery.tsx` | Add fade-in animation class on new image cards |

### Technical Details

**useFreestyleImages.ts -- add batch save:**

```tsx
const saveImages = useCallback(async (
  base64DataUrls: string[],
  meta: SaveImageMeta,
): Promise<FreestyleImage[]> => {
  if (!user) return [];
  
  const results = await Promise.all(
    base64DataUrls.map(async (base64DataUrl) => {
      // upload to storage + insert DB row (same logic as saveImage)
      // ... returns FreestyleImage or null
    })
  );
  
  const saved = results.filter(Boolean) as FreestyleImage[];
  // Update state ONCE with all images
  setImages(prev => [...saved, ...prev]);
  return saved;
}, [user]);
```

**Freestyle.tsx -- keep generating visible until save completes:**

```tsx
const [isSaving, setIsSaving] = useState(false);

// In handleGenerate, after API returns:
if (result?.images.length > 0) {
  setIsSaving(true);       // keep generating cards visible
  deductCredits(creditCost);
  await saveImages(result.images, { ... });
  setIsSaving(false);      // now hide generating cards
}

// Pass to gallery:
generatingCount={(isLoading || isSaving) ? imageCount : 0}
```

**useGenerateFreestyle.ts -- expose a way to keep loading active:**

Instead of auto-clearing `isLoading` in `finally`, return the result and let `Freestyle.tsx` manage the full lifecycle. The hook will still clear on error, but on success the caller decides when to end the loading state.

**FreestyleGallery.tsx -- smooth fade-in for new images:**

Add `animate-in fade-in duration-500` to image cards so they smoothly appear when the generating cards are swapped out, rather than popping in abruptly.

