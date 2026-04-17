

## Tighten desktop copy on /app/products empty state

### Current copy (too wordy, repeats "Visual Types" twice)
- Page header title: "Products"
- Page header subtitle: "Manage your products. Upload once and use them across Visual Types."
- Empty card title: "Add your first product"
- Empty card subtitle: "Upload images, paste a link, or import in bulk. Each image becomes a product you can reuse across all Visual Types."

### Issues
1. "Visual Types" appears in both subtitles back-to-back — redundant.
2. Page subtitle is generic ("Manage your products") — doesn't add value next to "Products" title.
3. Empty card subtitle has two sentences where one would do; the second sentence repeats the value prop already implied.
4. Combined effect: ~40 words of intro before the user reaches the actions.

### Proposed copy (desktop)
- **Page subtitle:** "Upload once. Reuse across every Visual Type." (8 words, punchier, single value prop)
- **Empty card subtitle:** "Upload images, paste a link, or import in bulk." (drops the redundant second sentence — the methods already speak for themselves)

Mobile already shortened in prior turn — keep "Upload photos or import in bulk." for the empty card, and apply the same new shorter page subtitle.

### Files to edit
- `src/pages/Products.tsx` (or wherever the PageHeader for /app/products renders) — update `subtitle` prop.
- `src/components/app/ProductsEmptyUpload.tsx` — shorten the desktop subtitle inside the card header (line ~42).

### Out of scope
- Layout, icons, methods rail, drawer, backend.

### Acceptance
- Desktop page subtitle reads: "Upload once. Reuse across every Visual Type."
- Desktop empty card subtitle reads: "Upload images, paste a link, or import in bulk."
- Mobile copy unchanged from current short version.
- "Visual Types" appears only once on the page (in the page subtitle).

