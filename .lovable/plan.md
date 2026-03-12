

## Show "Enhanced" Instead of "Freestyle" on Upscaled Library Cards

### Problem
The screenshot shows that upscaled images still display "Freestyle" as the source badge on the library card, even though we already fixed the detail modal. The card hover overlay (line 113-117) doesn't account for upscaled items.

### Change — 1 file

**`src/components/app/LibraryImageCard.tsx`** (lines 112-118)

Update the hover badge logic to show "Enhanced" for upscaled items instead of inheriting the source label:

```tsx
{item.quality?.startsWith('upscaled_') ? (
  <><Sparkles className="w-3 h-3" /> Enhanced</>
) : item.source === 'freestyle' ? (
  <><Sparkles className="w-3 h-3" /> Freestyle</>
) : (
  <><Camera className="w-3 h-3" /> {item.label}</>
)}
```

