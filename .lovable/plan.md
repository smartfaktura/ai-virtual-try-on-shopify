

## Library: Hover Download Button + Bulk Select & Download as ZIP

### 1. Add Download Icon on Hover

On each `LibraryImageCard`, show a small download button in the bottom-right corner on hover. Clicking it downloads that single image directly (without opening the detail modal).

**Changes to `LibraryImageCard.tsx`:**
- Import `Download` from lucide-react
- Add a download button inside the hover overlay (bottom-right)
- The button calls `e.stopPropagation()` to prevent opening the modal, then fetches the image and triggers a browser download

### 2. Bulk Select Mode with ZIP Download

Add a "Select" toggle button in the Library header. When active:
- Each card shows a checkbox overlay (top-left corner)
- Clicking a card toggles selection instead of opening the modal
- A floating action bar appears at the bottom showing selected count + "Download as ZIP" button
- Clicking "Download as ZIP" fetches all selected images and bundles them using JSZip, then downloads the .zip file

**Changes to `Jobs.tsx`:**
- Add `selectMode` boolean state and `selectedIds` Set state
- Add "Select" toggle button next to the sort pills
- When `selectMode` is on, card clicks toggle selection instead of opening modal
- Show a floating bottom bar when items are selected: `"X selected" + [Download ZIP] + [Cancel]`
- Implement `handleBulkDownload` that uses JSZip to create a zip from all selected image URLs

**Changes to `LibraryImageCard.tsx`:**
- Add `selected` and `selectMode` props
- When `selectMode` is true, show a checkbox circle overlay (top-left) -- filled when selected, empty when not
- Adjust hover behavior so the card shows selection state

**New dependency:**
- `jszip` -- lightweight library for creating ZIP files in-browser

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/app/LibraryImageCard.tsx` | Add download button on hover (bottom-right), add `selected`/`selectMode` props with checkbox overlay |
| `src/pages/Jobs.tsx` | Add select mode toggle, selected items state, floating action bar with ZIP download |

### Technical Details

**Hover download button (LibraryImageCard):**
```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    // fetch + download logic
  }}
  className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
>
  <Download className="w-4 h-4" />
</button>
```

**Select mode checkbox overlay:**
```tsx
{selectMode && (
  <div className="absolute top-3 left-3 z-10">
    <div className={cn(
      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
      selected ? "bg-primary border-primary text-white" : "border-white/70 bg-black/30"
    )}>
      {selected && <Check className="w-3.5 h-3.5" />}
    </div>
  </div>
)}
```

**Floating action bar (Jobs.tsx):**
```tsx
{selectedIds.size > 0 && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-foreground text-background shadow-2xl">
    <span className="text-sm font-medium">{selectedIds.size} selected</span>
    <Button onClick={handleBulkDownload}>
      <Download className="w-4 h-4 mr-2" /> Download ZIP
    </Button>
    <button onClick={() => { setSelectedIds(new Set()); setSelectMode(false); }}>
      Cancel
    </button>
  </div>
)}
```

**Bulk download with JSZip:**
```tsx
import JSZip from 'jszip';

const handleBulkDownload = async () => {
  const zip = new JSZip();
  const selected = items.filter(i => selectedIds.has(i.id));
  for (const item of selected) {
    const res = await fetch(item.imageUrl);
    const blob = await res.blob();
    zip.file(`${item.label}-${item.id.slice(0,8)}.png`, blob);
  }
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'library-images.zip';
  a.click();
  URL.revokeObjectURL(url);
};
```
