

# Fix: Replace "Original" ratio with auto-detected closest ratio + auto-enable Pro in edit mode

## Problem

The `original` aspect ratio value is sent to the AI provider API, which rejects it (only accepts `1:1`, `3:4`, `4:5`, `9:16`, `16:9`). The error in the screenshot confirms: `invalid_value`.

## Solution

Remove `original` from the ratio list entirely. Instead, detect the uploaded image's dimensions and auto-select the closest matching ratio from the existing set. Also auto-enable Pro quality when entering edit mode.

## Changes

### File 1: `src/components/app/freestyle/FreestyleSettingsChips.tsx`

- Remove `'original'` from the `FreestyleAspectRatio` type union
- Remove the `{ value: 'original', ... }` entry from the `ASPECT_RATIOS` array

### File 2: `src/pages/Freestyle.tsx`

**A. Add image dimension detection helper:**
```typescript
function detectClosestRatio(imageUrl: string): Promise<FreestyleAspectRatio> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const r = img.width / img.height;
      // Compare to supported ratios: 1:1(1.0), 3:4(0.75), 4:5(0.8), 9:16(0.5625), 16:9(1.778)
      const ratios: { value: FreestyleAspectRatio; r: number }[] = [
        { value: '1:1', r: 1 },
        { value: '3:4', r: 0.75 },
        { value: '4:5', r: 0.8 },
        { value: '9:16', r: 0.5625 },
        { value: '16:9', r: 1.7778 },
      ];
      let best = ratios[0];
      for (const entry of ratios) {
        if (Math.abs(r - entry.r) < Math.abs(r - best.r)) best = entry;
      }
      resolve(best.value);
    };
    img.onerror = () => resolve('1:1');
    img.src = imageUrl;
  });
}
```

**B. Auto-detect ratio on image upload** (`handleFileSelect` and `handleFileDrop`):
After setting the preview URL, call `detectClosestRatio(previewUrl)` and set the aspect ratio.

**C. Auto-detect ratio on edit from Library** (the `editImage` useEffect ~line 303):
Replace `setAspectRatio('original')` with `detectClosestRatio(editImageParam).then(setAspectRatio)`.

**D. Auto-enable Pro quality in edit mode** (~line 303):
Add `setQuality('high')` when entering edit mode.

## Files changed

1. `src/components/app/freestyle/FreestyleSettingsChips.tsx` — remove `original` option
2. `src/pages/Freestyle.tsx` — add ratio detection, auto-select closest ratio on upload/edit, auto-enable Pro quality

