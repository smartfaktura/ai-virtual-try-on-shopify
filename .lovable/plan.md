

## /app/products — unify toolbar on desktop/tablet + bolder Add Products

Scope: `src/pages/Products.tsx` only. Mobile (`<sm`) layout untouched.

### Changes

**1. One-line toolbar on desktop & tablet (`sm:` and up)**

Merge the current 2 rows (search row + filter row) into a single row:

```
[🔍 Search......]   [All Types ▾]  [Newest first ▾]   ······   [▦ ☰]
```

- Search: `flex-1 max-w-md` on the left
- Filters: `All Types` + `Newest first` selects right next to search
- View toggle: pushed to the far right with `ml-auto`
- All controls share `h-10` for clean alignment
- Remove the now-redundant separate filter row on `sm+`; mobile keeps its own search + tools row exactly as-is

**2. Tablet placeholder shortened**

Use shorter placeholder on `sm` (tablet) where horizontal space is tighter:
- `placeholder="Search"` from `sm` to `md`
- `placeholder="Search products..."` on `md+` and on mobile

Implementation: two inputs swapped via responsive `hidden`/`block` classes, OR (cleaner) single input with placeholder reading from a value derived from `useIsMobile`/window — go with the two-input swap for simplicity (`sm:hidden`, `hidden sm:block md:hidden`, `hidden md:block`).

Actually simpler: keep one input and set placeholder dynamically using a small `useEffect`+resize listener — but to avoid re-renders just use Tailwind by rendering different inputs conditionally. We'll use 3 conditional inputs (mobile, tablet sm-only, desktop md+) — only one mounts visually.

**3. Bigger, more connected Add Products in header**

The button currently sits far away (top-right, small). Make it feel grounded:
- Bump size: `h-10` → `h-11`, add `px-5`, `text-sm font-semibold`
- Add subtle shadow: `shadow-sm hover:shadow-md transition-shadow`
- Keep position in `PageHeader actions` slot but ensure it visually balances with title (no other change needed; PageHeader already aligns it to the title row)

### File touched
- `src/pages/Products.tsx` — toolbar block (lines 248–365) + headerActions button (lines 232–240)

### Acceptance
- Desktop (`md+`): Search + All Types + Newest first + view toggle on ONE line
- Tablet (`sm` to `md`): same one-line layout, but search placeholder reads "Search"
- Mobile: unchanged (search → full-width Add Products → tools row)
- Add Products button visibly larger (h-11, px-5, semibold) with subtle shadow, feels anchored to header
- All desktop controls aligned at `h-10`

