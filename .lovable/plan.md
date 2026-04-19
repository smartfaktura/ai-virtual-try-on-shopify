

## Root cause (now confirmed)

When the Add Product drawer is open on `/app/products` and the user presses Cmd/Ctrl+V once, **two paste listeners fire for the same event**:

1. **`src/pages/Products.tsx`** lines 119–146 — window-level `paste` listener that captures the file and calls `setAddInitialFiles(files)` + `setAddOpen(true)`. This causes `ManualProductTab` to receive the file via the `initialFiles` prop, and the `useEffect` at line 153 calls `addFiles(initialFiles)`.

2. **`src/components/app/ManualProductTab.tsx`** lines 371–392 — document-level `paste` listener that captures the same file and calls `addFiles([file])` directly.

Both run on the same Cmd+V event → `addFiles` runs twice with the same file → **2 cards appear from 1 paste**, and the second `addFiles` triggers the "single → batch" promotion path (lines 240–276) which creates the messy state where one card is empty and the other is stuck "Analyzing".

The previously-diagnosed JSON-parse failure in `analyze-product-image` is a real but secondary issue — it makes the analyze step fail silently. The PRIMARY bug is the duplicate-paste capture.

## Fix plan

### Fix 1 (primary) — Stop the duplicate paste capture
File: `src/components/app/ManualProductTab.tsx`, lines 371–393.

When the drawer is open AND `Products.tsx`'s window-level paste handler is active, the document-level one is redundant. Two options, I'll do BOTH:

- **(a) Remove the duplicate document-level paste handler entirely.** The `Products.tsx` window-level handler already covers this case (it always fires when the user pastes anywhere on the page). The drawer is always reached via that page, so its files get forwarded via `initialFiles`. For `AddProduct.tsx` standalone page, it doesn't have its own paste handler, but we can keep paste behavior by routing through a single source of truth.
- **(b) Add a guard** so that even if both handlers existed, the same file (same name + size + lastModified) added within 300ms is rejected as a duplicate. This is the belt-and-suspenders defense.

Implementation: drop the `useEffect` at lines 371–393. Add a small `recentFilesDedupeRef` set in `addFiles` that rejects files matching a recently-added signature within 300ms.

### Fix 2 (secondary) — Robust JSON parsing in the edge function
File: `supabase/functions/analyze-product-image/index.ts`, line 109.

Replace the greedy regex `/\{[\s\S]*\}/` with:
1. Strip ` ```json ` and ` ``` ` markdown fences.
2. Find the first `{` and walk forward counting brace depth to extract the matching `}`.
3. If `JSON.parse` still fails, return HTTP 200 with `{ error: "Could not parse AI response" }` (soft fail — same path as gateway-unavailable, so the client clears its spinner gracefully).

### Fix 3 (resilience) — Surface errors + safety timeout in client
File: `src/components/app/ManualProductTab.tsx`, lines 173–207 and `runBatchAnalysis` 329–350.

- In the catch path, also show a single debounced toast: *"AI analysis unavailable for some items — please fill in manually."*
- In `runBatchAnalysis`, attach a 30-second safety timeout per item: if `isAnalyzing` is still true after 30s, force-clear it.

## Files to edit

- `src/components/app/ManualProductTab.tsx` — remove duplicate paste handler, add file-signature dedupe in `addFiles`, add safety timeout in `runBatchAnalysis`, debounced error toast in `analyzeImage` catch.
- `supabase/functions/analyze-product-image/index.ts` — robust JSON extraction, soft-fail HTTP 200.

## Result

- Pasting one image creates exactly one card. No more phantom duplicates.
- Even when the AI returns malformed JSON, the spinner clears and the user sees a single helpful toast instead of a permanently-stuck "Analyzing…" state.
- No regression for drag-drop, browse, or CSV uploads (those don't go through paste handlers).

