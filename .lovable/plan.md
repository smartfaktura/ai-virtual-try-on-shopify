## Problem

On `/app/generate/product-images`, the **"Try a demo product"** modal has two visual bugs when the product grid is tall enough to scroll:

1. The scrollbar runs flush against the rounded corner of the dialog, so it gets visually clipped at the top/bottom edges
2. The grid content scrolls *underneath* the absolutely-positioned `×` close button, and the scroll track sits behind/next to it — making the close button feel like it's overlapping the content

Root cause: the shared `DialogContent` primitive (`src/components/ui/dialog.tsx`) puts `overflow-y-auto` on the whole rounded container (with `p-6`). For a normal short dialog that's fine, but `DemoProductPicker` has a tall product grid, so the entire dialog body scrolls — including past the close button and into the rounded corners.

## Fix

Restructure only `src/components/app/product-images/DemoProductPicker.tsx` (do **not** touch the shared `dialog.tsx` primitive — other modals depend on its current behavior) so that:

- The dialog itself stays a fixed, non-scrolling rounded shell
- Only the **grid area** scrolls, inside an inner container with proper padding so the scrollbar sits inside the rounded corners and away from the close button

### Changes to `DemoProductPicker.tsx` (desktop branch only)

1. On `<DialogContent>`, add `max-h-[85vh] overflow-hidden p-0` so the outer card no longer scrolls and the rounded corners cleanly contain the inner scroll area
2. Wrap the header in its own non-scrolling block with `px-6 pt-6 pb-3` (keeps the close `×` aligned and away from scroll content)
3. Wrap the grid in a scroll container: `<div className="overflow-y-auto px-6 pb-6 max-h-[calc(85vh-7rem)]">` so only the products scroll, with horizontal padding that keeps the scrollbar visually inside the rounded shape
4. Bump `sm:max-w-2xl` → `sm:max-w-3xl` slightly so the 3-column grid breathes a bit more on desktop (optional polish, matches the screenshot density)

Mobile (Drawer) branch already handles this correctly (`overflow-y-auto` on an inner div) — no changes needed there.

### Files touched

- `src/components/app/product-images/DemoProductPicker.tsx` — single file, ~10 lines changed

### Out of scope

- No change to `src/components/ui/dialog.tsx` (would affect every modal in the app)
- No change to demo product data, selection logic, or mobile drawer
