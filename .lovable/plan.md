

## Add Clipboard Paste Support to "From Scratch" Upload

### Problem
The "From Scratch" upload zone only supports click-to-browse and drag-and-drop. There's no clipboard paste listener for it, even though the UI mentions paste in the reference upload zones.

### Changes

**`src/pages/Perspectives.tsx`** — Add a paste event listener that fires when `sourceType === 'scratch'` and no image is uploaded yet:

1. **Add a `useEffect`** (near line 408) that listens for `paste` events when `sourceType === 'scratch' && !directUploadUrl`. On paste, extract the image file from clipboard and call `handleDirectUpload` (adapted to accept a `File` directly).

2. **Update the upload zone UI** (lines 828-833): Add the paste hint text (`⌘V / Ctrl+V to paste from clipboard`) below the existing "Click to browse or drag and drop" text, and add `onDrop`/`onDragOver` handlers for proper drag-and-drop support on the label element.

3. **Extract file handling**: The current `handleDirectUpload` reads from `e.target.files[0]`. Add a small helper or refactor so both the file input `onChange` and the paste handler can share the same upload logic with a `File` argument.

### Files changed
| File | Change |
|------|--------|
| `src/pages/Perspectives.tsx` | Add paste listener for scratch mode, add paste hint UI, refactor file handler |

