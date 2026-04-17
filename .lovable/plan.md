

## Issues found in the compact URL drawer (and others)

### 1. URL input clipped at right edge (your screenshot)
`StoreImportTab` uses `flex gap-2` with `flex-1` Input + Import button. Inside the wide Sheet (720px) the form has no right padding constraint and the Input's relative wrapper isn't fully containing — the focus ring + border touch the Sheet's right edge. **Fix:** wrap `StoreImportTab` body in `min-w-0` and ensure `AddProductModal` compact body has consistent horizontal padding (currently the body inherits `px-7` from the Sheet wrapper but the inner overflow container clips the focus ring). Add `pr-1` on the scroll container so focus ring isn't sliced.

### 2. Floating "Cancel" link mid-page
Visible in your screenshot at right side, vertically centered — that's `StoreImportTab`'s own internal Cancel button rendering when there's lots of empty vertical space. In compact mode it looks orphaned and duplicates the Sheet's X close. **Fix:** hide the in-tab Cancel when the parent provides its own close affordance (always true in drawer). Pass an `embedded` flag or simply remove it — Sheet X + "Switch method" are enough.

### 3. Divider line above "Switch method" looks like a section break
The `border-t` creates a hard rule across the whole drawer width that visually separates content from a tiny ghost link. Feels broken. **Fix:** drop the `border-t`, reduce to a simple muted link aligned left with more breathing room (`pt-6` only).

### 4. Vast empty space below the form
URL form is ~200px tall but drawer is 100vh. The empty white void makes it feel unfinished. **Fix in compact mode:** add a subtle helper card below the form (e.g. "Works with Shopify · Etsy · Amazon · WooCommerce · any product page" already exists as badges — promote them visually) and let the Switch method link sit at true bottom via `mt-auto`.

### 5. Header lacks a back affordance
Compact mode shows only "Import from URL" + X. User who arrived from the empty state has no obvious way back to the empty state's other methods besides scrolling to the bottom-left "Switch method". **Fix:** add a small left-aligned chevron-left button next to the title that calls `onSwitchMethod`, mirroring iOS/Linear patterns. Keep bottom link as secondary.

### 6. Inconsistent padding in Sheet header vs body
Sheet header uses `px-7 pt-7 pb-4`, body uses `px-7 pb-7`. Fine on desktop, but the "Switch method" button bar should also sit inside the same padding — currently OK but the `border-t` makes it look like it spans full width. Removing the border (fix #3) resolves this.

### 7. (Bonus) Mobile compact mode has no header context
On mobile the Drawer header still says "Import from URL" but body fills under it without the bottom Switch method link being sticky. Make `Switch method` part of the DrawerFooter region so it's always visible without scroll.

### 8. (Bonus) "Switch method" uses ChevronDown but action goes back/up
Semantically wrong — opens the method rail above this view. Use `ChevronLeft` or `LayoutGrid` icon instead.

## Files to edit
- `src/components/app/AddProductModal.tsx` — header back-chevron in compact mode, drop `border-t` above Switch method, push to `mt-auto`, swap icon, ensure `min-w-0` on compact body wrapper, add `pr-1` to scroll container so focus rings aren't clipped.
- `src/components/app/StoreImportTab.tsx` — wrap root in `min-w-0`; hide internal Cancel button (or only render when not embedded); promote platform badges row visually as a quiet helper strip below the input.

## Out of scope
- Backend, import logic, error cards, role-assignment popover — all unchanged.

## Acceptance
- URL input no longer touches the right edge of the drawer; focus ring fully visible.
- No orphaned "Cancel" link floating in the middle of the drawer.
- "Switch method" sits cleanly at the bottom-left without a full-width divider; uses a left-pointing icon.
- Optional small back chevron in the header next to "Import from URL".
- Same fixes apply automatically to CSV / Shopify / Mobile compact modes (they share the same wrapper).

