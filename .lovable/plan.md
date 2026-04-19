

## What user wants

When a user pastes an image into the Add Products modal (or anywhere on `/app/products`), instead of showing the full method picker (Upload / URL / CSV / Mobile / Shopify) alongside the upload area, the modal should **immediately collapse to just the Upload workflow** — paste = implicit method selection. The pasted image becomes a mini preview inside the upload tab, and a small "Switch method" link remains as an escape hatch.

## Good news: infrastructure already exists

`AddProductModal` already supports a `compact` prop (lines 80, 112–130 of `src/components/app/AddProductModal.tsx`):
- Hides the "Method" rail with all 5 cards
- Header switches from "Add Products / Upload images or import…" to the active method's title/subtitle (e.g. "Upload images / Drag, drop, or browse to upload product photos.")
- Adds a back arrow + "Switch method" link to return to the full picker

The compact path is already wired in `Products.tsx` (`addCompact` state, `onSwitchMethod` reset). It's just **never set to `true` by the paste/drop handlers**.

## The fix (one file, ~3 lines)

**File: `src/pages/Products.tsx`**

In both side-effect handlers, set `setAddCompact(true)` alongside the existing state updates:

1. **Paste handler** (line ~140) — when files are captured from clipboard:
   ```ts
   setAddInitialTab('manual');
   setAddInitialFiles(files);
   setAddCompact(true);   // ← new
   setAddOpen(true);
   ```

2. **Drop handler** (line ~100) — when files are dropped on the page:
   ```ts
   setAddInitialTab('manual');
   setAddInitialFiles(files);
   setAddCompact(true);   // ← new
   setAddOpen(true);
   ```

3. **Reset on close** (line ~633) — also reset compact so reopening via the "Add Products" button shows the full picker again:
   ```ts
   onOpenChange={(o) => {
     setAddOpen(o);
     if (!o) {
       setAddInitialFiles(undefined);
       setAddCompact(false);   // ← new
     }
   }}
   ```

That's it. No changes to `AddProductModal.tsx`, `ManualProductTab.tsx`, or any tab component — they already handle the pasted file as an `initialFile` and render the preview card.

## Result

- User on `/app/products` presses Cmd/Ctrl+V → drawer opens directly into "Upload images" mode with the pasted product preview card visible. The other 4 method options (Product URL, CSV, Mobile, Shopify) are **hidden**. Header reads "Upload images / Drag, drop, or browse…". A "Switch method" link is available if they change their mind.
- Same behavior when dragging a file onto the page.
- Clicking the "Add Products" button (no paste/drop) still opens the full method picker as before — unchanged.

## File to edit

- `src/pages/Products.tsx` — 3 small additions (set `addCompact` true in paste & drop handlers, reset it on close).

