

## Mobile fixes for /app/products empty state

### Problems on mobile (390px viewport)
1. "Drag & drop product images" — impossible on touch. Confusing CTA.
2. Header copy is too long for small screens.
3. Primary surface uses tiny "browse files" underline as the real action — not a real button. Hard to tap with thumb.
4. Helper microcopy ("PNG, JPG, WEBP · multiple…") wraps awkwardly.
5. "Cmd/Ctrl + V from clipboard" shown on Paste row makes no sense on phones (no keyboard shortcut).
6. Tip line ("clean background…") clutters mobile.

### Fix — responsive copy + real CTA on mobile
Use `useIsMobile` to branch copy/UX. Keep desktop unchanged.

**Primary card on mobile:**
- Title: "Upload product photos" (replaces "Drag & drop product images")
- Subtitle: "Tap to choose from your phone"
- Real **CTA button** (primary filled, full-width, h-11): "Choose photos" with UploadCloud icon — replaces tiny underline link
- Hide drag-helper text and the long "PNG, JPG, WEBP · multiple…" line on mobile (keep short version: "JPG, PNG, WEBP")
- Reduce min-height from 260px to 180px

**Header on mobile:**
- Title unchanged: "Add your first product"
- Subtitle shortened: "Upload photos or import in bulk."

**Paste row on mobile:**
- Hide entirely (no clipboard shortcut on touch — confusing). Keep Paste on desktop only.

**Tip line:** hide on mobile.

**Section label:** "Or import from" → keep, but margin-top tighter.

### Files to edit
- `src/components/app/ProductsEmptyUpload.tsx` — import `useIsMobile`, branch primary card content, filter METHODS to drop `paste` on mobile, shorten header subtitle, hide tip on mobile.

### Out of scope
- Drawer, backend, desktop layout, product cards.

### Acceptance
- On 390px: large "Choose photos" button is the obvious primary action; no "drag & drop" wording; Paste row hidden; subtitle short; tip hidden.
- On ≥768px: layout and copy unchanged from current.

