

## Make the desktop "Drop area" CTA explicit on /app/products empty state

### Problem (screenshot)
Desktop empty-state dropzone shows: icon → "Drag & drop product images" → "or **browse files**". The only clickable affordance is a tiny underlined "browse files" link. Users don't immediately see where to click — they hover/scan looking for a button.

### Fix — `src/components/app/ProductsEmptyUpload.tsx` (desktop branch of dropzone)
Keep the dashed drop area (drag/drop is real on desktop), but make the action obvious by adding a real button inside:

- Icon circle (existing) at top
- Heading: **"Drag & drop product images"** (unchanged)
- Sub: **"or click to browse from your computer"** (replaces the inline `browse files` link — no more underlined-text-as-CTA)
- Solid primary `<Button size="sm" rounded-full>` with `UploadCloud` icon: **"Choose photos"** (centered, ~h-9, mt-3)
- Footnote: **"PNG, JPG, WEBP · multiple files supported"** (unchanged, text-[11px])

The button click triggers the same hidden file input that the dashed area click already triggers (reuse existing handler — no behavior change). The dashed wrapper still accepts drops and still acts as a click target for users who tap anywhere in it.

Mobile branch (already a "Choose photos" button card) — no change.

### Out of scope
- Modal `ManualProductTab` desktop dropzone (separate component, can be done in follow-up if you want symmetry).
- Backend, drop handlers, accept types, batch logic.

### Acceptance
- Desktop empty state shows a visible primary "Choose photos" button inside the drop area.
- No more underlined "browse files" link — the button is the obvious action.
- Drag & drop still works; clicking anywhere in the dashed area still opens the file picker.
- Mobile view unchanged.

