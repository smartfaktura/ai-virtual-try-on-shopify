

## Refined Plan: Fix Mobile UI Freeze in Freestyle

### Root Cause (confirmed)

Lines 256-262 of `Freestyle.tsx` — the `uploadImageToStorage` function uses a synchronous `atob` + charCode loop to convert base64 to a Blob. For a 5-10MB mobile photo, this runs millions of iterations on the main thread, freezing the UI.

Additionally, lines 318-319 and 332-333 do **unnecessary work**: model/scene images are already HTTPS URLs, but the code converts them to base64 via `convertImageToBase64`, then immediately converts back to blob for upload — a pointless round-trip that compounds the freeze.

### Is the previous plan good? Mostly — but with refinements:

**What was right:**
- Replacing `atob` + loop with `fetch(dataUrl).then(r => r.blob())` — correct, this is the standard modern approach
- Adding `isUploading` state for immediate feedback — correct

**What needs adjustment:**
- Storing raw `File` objects is unnecessary complexity. The simpler fix: just replace the blob conversion method inside `uploadImageToStorage` (3 lines changed vs. a full refactor)
- Model/scene images: skip the `convertImageToBase64` call entirely — they're already HTTPS URLs, just pass them through. The edge function can fetch them directly.

### Refined plan (minimal, surgical)

**File: `src/pages/Freestyle.tsx`**

**Change 1** — `uploadImageToStorage` (lines 256-262): Replace the blocking `atob` loop with browser-native `fetch`:

```typescript
// OLD (blocks main thread for seconds on mobile):
const byteString = atob(raw);
const ab = new ArrayBuffer(byteString.length);
const ia = new Uint8Array(ab);
for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
const blob = new Blob([ab], { type: mime });

// NEW (non-blocking, browser-native):
const response = await fetch(base64Data);
const blob = await response.blob();
```

This eliminates the `[header, raw]` split, `atob`, and loop entirely — just 2 lines.

**Change 2** — `handleGenerate` model upload (lines 317-327): Skip `convertImageToBase64` — pass the URL directly:

```typescript
// OLD:
const modelImg = await convertImageToBase64(selectedModel.previewUrl);
modelImageUrl = await uploadImageToStorage(modelImg, 'model');

// NEW:
modelImageUrl = selectedModel.previewUrl; // Already HTTPS, pass directly
```

**Change 3** — `handleGenerate` scene upload (lines 330-339): Same fix:

```typescript
sceneImageUrl = selectedScene.previewUrl; // Already HTTPS, pass directly
```

**Change 4** — Add `isUploading` state (line 130): Show immediate feedback when Generate is tapped:

```typescript
const [isUploading, setIsUploading] = useState(false);
const isLoading = isEnqueuing || isProcessing || isUploading;
```

Set `isUploading = true` at top of `handleGenerate`, `false` in finally block.

### Summary

4 surgical changes in 1 file. No new files, no architectural changes. The main fix (Change 1) replaces a blocking loop with a 2-line browser-native call. Changes 2-3 eliminate unnecessary image processing entirely. Change 4 prevents double-taps.

