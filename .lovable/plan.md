## Fix "Download all" to produce a real ZIP in /app/product-swap

Currently the results page loops through anchor `<a download>` clicks, which browsers treat as separate downloads (often blocked or saved as individual files), not a ZIP.

### Change
In `src/pages/ProductSwap.tsx`, replace the "Download all" button's `onClick` handler with a call to the existing `downloadDropAsZip` helper from `@/lib/dropDownload` — the same utility used elsewhere in the app for bulk downloads.

### Behavior
- Click "Download all" → toast "Packaging N images…"
- Fetches all result URLs, packages into a single `.zip`
- Filename: `product-swap-YYYY-MM-DD.zip`
- Each file inside named by product + scene (handled by helper)
- Success/error toast on completion

### Scope
- One file: `src/pages/ProductSwap.tsx` (button handler only, ~20 lines)
- No backend, RLS, or edge-function changes
- No new dependencies (helper already exists)
