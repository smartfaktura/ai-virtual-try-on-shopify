

## Root causes (confirmed by logs + code reading)

### Bug 1: Duplicate cards from one paste
The dedup signature is `name|size|lastModified`, but **both paste handlers create files with `pasted-${Date.now()}.png` independently** — `Products.tsx` line 134 AND `ManualProductTab.tsx` line ~424 both call `new File([blob], 'pasted-${Date.now()}...')`. `Date.now()` differs by 0–2ms between the two listeners, so the **filenames differ** → dedup misses → 2 cards.

The "early return when `initialFiles !== undefined`" guard in `ManualProductTab` doesn't help because on the first paste, `initialFiles` is still `undefined` from the previous render — both handlers fire on the same event before React re-renders.

### Bug 2: Analyze always fails with "position 1 column 2"
Edge function logs show the AI returns **perfectly valid JSON**, but our sanitization step (line 134) is **breaking it**:

```ts
sanitized = jsonStr.replace(/[\x00-\x1F\x7F]/g, ch => 
  ch === '\n' ? '\\n' : ...  // converts STRUCTURAL newlines to literal '\n' escape
);
```

JSON allows raw whitespace newlines between tokens but does **NOT** allow a literal `\n` escape sequence outside string values. So `{\n  "title"` becomes `{\n  "title"` (literal backslash-n) → parser chokes at position 1. Every analyze call fails. The client clears the spinner via the soft-fail toast — but card #2 keeps trying because of the safety timeout race.

## Fix plan (small, decisive)

### Fix A — Kill duplicate paste at the source
In `src/components/app/ManualProductTab.tsx`:

**Remove the document-level paste handler entirely** (lines ~415–439). The page-level handler in `Products.tsx` already covers every paste case for the drawer. For the standalone `/app/add-product` page (if it exists without a parent paste handler), keep paste capture by adding the listener **only when `initialFiles === undefined` AND not in editing mode**, AND add a window-level guard `e.defaultPrevented` check so we skip if `Products.tsx` already handled it (`Products.tsx` already calls `e.preventDefault()` on line 139).

**Also fix the dedup signature** to use file content size + first 1KB hash isn't worth it; instead use `${file.size}|${blob_first_bytes_marker}` is overkill. Simpler: **dedup on `(size, type)` within 500ms** for paste-originated files (they always have unique-timestamped names but same size+type). This catches the dual-listener case reliably.

### Fix B — Stop corrupting valid JSON
In `supabase/functions/analyze-product-image/index.ts`:

Replace the broad `replace(/[\x00-\x1F\x7F]/g, ...)` with a **string-aware** sanitizer that only escapes control chars **inside string values**, leaving structural whitespace alone. Walk the extracted JSON respecting `inString` state (we already do this in `extractJsonObject` — reuse that pattern).

Or simpler: **just try `JSON.parse(jsonStr)` first** without any sanitization (the AI nearly always returns clean JSON), and only fall back to sanitization if that fails — and the fallback should escape control chars **only when inside a quoted string**.

### Fix C — Test it works end-to-end
Use `supabase--curl_edge_functions` to send a real image to `analyze-product-image` and confirm we get a parsed JSON response, not `{ error: "Could not parse..." }`.

## Files to edit

- `src/components/app/ManualProductTab.tsx` — remove document-level paste handler (or guard with `e.defaultPrevented`); change dedup signature to `size|type` with 500ms window.
- `supabase/functions/analyze-product-image/index.ts` — replace broken sanitizer with string-aware version (try raw parse first, then string-aware fallback).

## Result

- One paste → one card. Verified by the dedup using `size|type` (paste blobs always share these), even when names differ by milliseconds.
- Analyze actually returns parsed `{ title, productType, description }` → cards populate fields immediately, no more permanent "Analyzing…".
- No regression for drag-drop (different files have different size/type combos), file picker (real filenames are stable), or CSV upload (different code path).

