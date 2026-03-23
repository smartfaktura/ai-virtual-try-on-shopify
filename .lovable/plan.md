

# Fix: Copy to Editor in Detail Modal Missing Model/Scene/Product

## Problem
The `libraryItem` object built for the `LibraryDetailModal` (line 964-974 in Freestyle.tsx) does not include `modelId`, `sceneId`, or `productId`. So when the modal's "Copy to Editor" button fires `onCopySettings`, it only has the prompt — the other settings are `undefined`.

The gallery hover copy works correctly because it reads directly from the `FreestyleImage` object which has all fields.

## Fix

### `src/pages/Freestyle.tsx` (line 964-974)

Add the three missing fields to the `libraryItem` construction:

```tsx
const libraryItem: LibraryItem = {
  id: img.id,
  imageUrl: img.url,
  source: 'freestyle',
  label: dynamicLabel,
  prompt: img.userPrompt || undefined,
  date: '',
  createdAt: '',
  aspectRatio: img.aspectRatio || '1:1',
  quality: 'standard',
  modelId: img.modelId,      // add
  sceneId: img.sceneId,      // add
  productId: img.productId,  // add
};
```

One file, 3 lines added.

