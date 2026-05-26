## Problem

In `AddProductModal.tsx` full mode, the Method picker always renders the full 5-row list above the active tab's content. After the user picks "Upload images" the form (MAIN PHOTO / EXTRA ANGLES / fields) is squeezed into the bottom half of the drawer.

## Fix — collapse Method picker after a selection

`src/components/app/AddProductModal.tsx` (desktop `fullBody`, lines 170-206)

Add local state `const [methodExpanded, setMethodExpanded] = useState(false)`.

Replace the always-on method list with:

- **Collapsed (default after open / whenever `!methodExpanded`)**: a single compact row showing only the active method (icon + label + sub) with a small `Change method` link/button on the right. Same `rounded-xl border bg-background/50` styling but only one row — frees ~4× vertical space for the form.
- **Expanded (`methodExpanded === true`)**: the existing full 5-row list. Clicking any row sets the tab AND collapses back (`setMethodExpanded(false)`).

Reset `methodExpanded` to `false` whenever `open` toggles true (mirrors the existing `useEffect`).

Mobile branch (lines 135-169) is already a compact 2-tile grid, leave untouched.

No changes to compact mode, edit mode, props, or any tab content.