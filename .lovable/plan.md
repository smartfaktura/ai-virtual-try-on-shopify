

## Add Clipboard Paste Support for Image Upload in Freestyle

### What
Allow users to paste images (Ctrl/Cmd+V) directly into the Freestyle prompt area. The pasted image will be handled exactly like a drag-and-dropped or file-picked image — it sets the source image preview and converts to base64.

### How

**`src/components/app/freestyle/FreestylePromptPanel.tsx`**
- Add a `useEffect` that listens for the `paste` event on the document (or scoped to the panel container)
- In the paste handler, check `e.clipboardData.items` for image types
- Extract the `File` from the clipboard item and call `onFileDrop(file)` — reusing the existing file handling path
- No new props needed since `onFileDrop` already exists

**Changes (~15 lines):**
```
useEffect(() => {
  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items || !onFileDrop) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) onFileDrop(file);
        return;
      }
    }
  };
  document.addEventListener('paste', handlePaste);
  return () => document.removeEventListener('paste', handlePaste);
}, [onFileDrop]);
```

Single file change, reuses existing `onFileDrop` handler — no backend or storage changes needed.

