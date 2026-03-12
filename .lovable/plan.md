

## Fix Library Detail Modal for Upscaled Images

### Problem
Upscaled images in the library detail modal show "FREESTYLE" as the source label and display the prompt (which contains technical text like "Upscaled from generation/..."). For upscaled items, both are irrelevant and should be hidden/replaced.

### Changes — 1 file

**`src/components/app/LibraryDetailModal.tsx`**

1. **Source label (line 133-135)**: Show "Enhanced" instead of "Freestyle" / "Generation" when the item is upscaled.

2. **Label (line 137)**: Show "Enhanced Image" or similar instead of "Freestyle" when upscaled.

3. **Prompt section (lines 160-169)**: Hide the entire prompt block when the item is upscaled, since the prompt is either inherited or a fallback label — neither is useful to the user.

```tsx
// Line 133-135: source label
<p className="...">
  {isUpscaled ? 'Enhanced' : item.source === 'freestyle' ? 'Freestyle' : 'Generation'}
</p>

// Line 160-169: hide prompt for upscaled items
{item.prompt && !isUpscaled && (
  <div className="space-y-2">
    ...
  </div>
)}
```

