## Scene step: align search + Upload styles, fix focus-border clipping

In `src/pages/ProductSwap.tsx` (Step 1 scene picker, lines 632-642).

### Issues
1. Search `<Input>` and Upload `<Button variant="outline" size="sm">` have different heights and corner radii — they don't visually match.
2. On focus/hover, the search input's bold ring/border gets clipped by the surrounding container.

### Changes
- Make the search Input pill-shaped and taller: `h-11 rounded-full pl-10 pr-4 text-sm` and increase the `Search` icon left offset to `left-3.5`.
- Swap the Upload button to `size="pill"` (matches existing pill convention used elsewhere on the page) with `h-11 rounded-full px-5 shrink-0`, keeping `Upload` icon + label.
- Wrap the row in a `py-1 px-px` container (or add `py-0.5`) so the focus ring isn't clipped by the parent. Use `overflow-visible` on the immediate parent if needed.

### Scope
- Single file, one row of JSX. Frontend only. No backend or business-logic changes.
