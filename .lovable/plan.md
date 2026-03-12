

## Fix: Show "Enhanced" Instead of "Freestyle" for Upscaled Items

### Problem
In the detail modal, upscaled images still show **"Freestyle"** as the title (line 137). The small source tag above correctly says "Enhanced", but the large heading still reads the original `item.label` which is "Freestyle".

### Change — 1 file

**`src/components/app/LibraryDetailModal.tsx`** (line 137)

Override `item.label` when the item is upscaled — display "Enhanced" instead of the original source label:

```tsx
{isUpscaled ? 'Enhanced' : item.label}
```

This ensures the large heading matches the source tag above it for upscaled items.

