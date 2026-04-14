

# Fix Zoomed Model Images in Short Film Picker

## Problem
The short film "Pick from Model Library" dialog renders model images with a custom inline template instead of reusing the `ModelSelectorCard` component used everywhere else (product images, brand models). The inline version also passes `{ width: 200 }` to `getOptimizedUrl`, which may cause blurry upscaling at display size.

## Fix

### File: `src/components/app/video/short-film/ReferenceUploadPanel.tsx`

Replace the custom `renderItem` callback (lines 328-343) with the shared `ModelSelectorCard` component:

```typescript
// Before (custom inline render):
renderItem={(m) => (
  <button ...>
    <div className="aspect-[3/4] bg-muted/30 rounded-t-lg overflow-hidden">
      <ShimmerImage src={getOptimizedUrl(m.previewUrl, { width: 200, quality: 60 })} ... />
    </div>
    <p className="text-xs font-medium ...">{m.name}</p>
  </button>
)}

// After (reuse ModelSelectorCard):
renderItem={(m) => (
  <ModelSelectorCard
    key={m.modelId}
    model={m}
    isSelected={false}
    onSelect={() => pickModel(m)}
  />
)}
```

This ensures:
- Same `aspect-[3/4]` ratio with proper `object-cover` framing
- Same optimized image URL logic (no forced 200px width)
- Gradient overlay with name at bottom
- Hover/focus states matching the rest of the app

### Import
Add `import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';` to the file.

| File | Change |
|------|--------|
| `src/components/app/video/short-film/ReferenceUploadPanel.tsx` | Use `ModelSelectorCard` in model picker `renderItem` + add import |

