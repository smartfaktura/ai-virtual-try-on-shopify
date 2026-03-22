

# Fix Admin Metadata Editor: Show Current Category + Add Image Thumbnails to Dropdowns

## Problem
1. The Category dropdown doesn't show the current category value — it appears blank.
2. Model and Scene dropdowns are text-only, making it hard to identify items visually.

## Root Cause
The category `SelectTrigger` has no `placeholder` and the `SelectValue` doesn't render the current value visibly because the `editCategory` state initializes correctly but the trigger may not be displaying it. Looking at the code, the category Select uses `value={editCategory}` which should work — but the placeholder is missing so if `editCategory` is empty string on first render it shows blank.

## Changes

### `src/components/app/DiscoverDetailModal.tsx`

**1. Fix Category showing current value**
- Add `placeholder="Category"` to the category `SelectValue` (line 229).
- The `editCategory` state already initializes from `item.data.category`, so this should be sufficient. If the issue is timing, ensure the `useEffect` fires before render by checking the default.

**2. Add image thumbnails to Model and Scene dropdown items**
- In model `SelectItem` (line 243): Add a small `<img>` thumbnail (20×20px, `object-cover rounded`) before the model name using a flex layout.
- In scene `SelectItem` (line 254): Same pattern — small thumbnail + name.
- Use `getOptimizedUrl(url, { quality: 40 })` for the dropdown thumbnails since they're tiny.

### Updated SelectItem pattern:
```tsx
// Model items with thumbnails
{allModelOptions.map(m => (
  <SelectItem key={m.name} value={m.name} className="text-xs">
    <div className="flex items-center gap-2">
      <img src={getOptimizedUrl(m.imageUrl, { quality: 40 })} 
           alt="" className="w-5 h-5 rounded object-cover shrink-0" />
      <span>{m.name}</span>
    </div>
  </SelectItem>
))}
```

Same for scene items.

One file, ~10 lines changed.

