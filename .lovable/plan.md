

## Match mobile empty-state CTA inside Add Products modal

### Problem
On mobile, when the user already has products, the only way to add more is the "Add Products" button → opens modal → defaults to "Upload images" tab → renders `ManualProductTab` which still shows the desktop-style dashed dropzone "Drop images, **browse**, or paste". On a phone:
- Drag/drop isn't possible
- "paste" isn't possible
- The clickable target is a vague dashed box, not a real CTA button

We already fixed this exact issue on the empty-state page (`ProductsEmptyUpload.tsx`) with a clean "Choose photos" button. The modal flow needs to match.

### Fix — `src/components/app/ManualProductTab.tsx` (lines 745-794, single-product empty dropzone)
Branch on `useIsMobile()` (already imported elsewhere in app; add import if missing):

**Mobile branch** (mirror the empty-state pattern exactly):
- Centered card, no dashed border (drag isn't a thing)
- Icon circle (`UploadCloud` or keep `ImagePlus`) at top
- Heading: "Upload product photos" (`text-base font-medium`)
- Sub: "Tap to choose from your phone" (`text-xs text-muted-foreground`)
- Solid primary `<Button>` full width, h-11, rounded-full: "Choose photos" (with `UploadCloud` icon)
- Footnote: "JPG, PNG, WEBP · up to {MAX_BATCH} at once" (`text-[11px]`)
- Hidden file input wired to button click (existing `dropzone-file-input` id reused)

**Desktop branch**: keep existing dashed dropzone unchanged (drag/drop + paste copy stays).

No changes needed to batch mode UI (only triggered after files are picked) or to the multi-angle slot layout (already mobile-friendly).

### Out of scope
- Empty-state page (already done)
- Other tabs (URL, CSV, Mobile, Shopify) — already have non-drop UIs
- Backend, batch logic, paste handler (still works on desktop)

### Acceptance
- On mobile, opening Add Products → Upload images tab shows the same clean "Choose photos" CTA card used on the empty state, no "drop / paste" wording.
- Tapping "Choose photos" opens the native file picker, multi-select supported, behavior identical to current.
- Desktop view unchanged (dashed dropzone with drop/browse/paste copy preserved).

