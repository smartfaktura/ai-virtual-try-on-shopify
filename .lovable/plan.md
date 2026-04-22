

## Spacious desktop/tablet sizing — Scene Look modal

The desktop sidebar nav and top filter bar use very small sizes (text-xs / text-[10px], py-1.5, h-8) that look cramped against the rest of the app. Bring them up to a comfortable, mobile-style scale starting at the `lg:` breakpoint (which is exactly when desktop layout kicks in inside this modal — sidebar is `hidden lg:block`, search/chips are `hidden lg:flex`).

### 1. Sidebar — `SceneCatalogSidebar.tsx`

Bump desktop (non-mobileMode) sizing closer to the mobile-mode scale:

- Sidebar width: `lg:w-60` → `lg:w-72`
- Outer padding: `px-3 py-2` → `px-4 py-4`
- Section labels: `text-[10px] px-2 pt-3 pb-1.5` → `text-[11px] px-3 pt-5 pb-2`
- Row spacing: `space-y-0.5` → `space-y-1`
- Quick / family rows: `py-1.5 px-2 text-xs rounded-md` → `py-2.5 px-3 text-sm rounded-lg`
- Sub-family (indented) rows: `pl-6 pr-2 py-1.5 text-xs` → `pl-9 pr-3 py-2 text-sm rounded-lg`
- Row icons: `w-3.5 h-3.5` → `w-4 h-4`
- Family chevrons: `w-3 h-3` → `w-3.5 h-3.5`; matching empty spacer also widens
- Count numbers: `text-[10px]` → `text-xs tabular-nums`

Result: the sidebar reads like the mobile drawer in the screenshot — generous tap targets, comfortable line-height, enough air between Quick and Product Families.

### 2. Top filter bar — `SceneCatalogFilters.tsx`

Make the desktop search input, Product Only / With Model chips, and Sort select feel like real, full-sized controls (matching the rest of the app):

- Bar vertical padding: `py-2.5` → `py-3.5`
- Search wrapper width: `lg:w-[280px]` → `lg:w-[340px]`
- Search input: `h-8 text-xs pl-8` → `h-10 text-sm pl-10`; icon `w-3.5 h-3.5` → `w-4 h-4` (and shift `left-3.5`); clear button `w-3 h-3` → `w-3.5 h-3.5`
- Subject chips: `px-3 py-1 text-xs` → `px-4 py-2 text-sm`, gap `gap-1.5` → `gap-2`
- "Clear all" link: `text-xs px-2 py-1` → `text-sm px-3 py-2`
- Desktop Sort select: `h-8 w-[140px] text-xs` → `h-10 w-[170px] text-sm`

### Untouched

Mobile layout (the existing `lg:hidden` row stays exactly as-is — it was already correctly sized), grid cards, header, footer, all hooks, RLS, `Freestyle.tsx`, `SceneCatalogModal.tsx` itself.

### Validation

- Desktop ≥1024px: sidebar visibly wider with mobile-style row spacing; search input + Product Only / With Model chips + Sort dropdown read at the same scale as primary controls elsewhere in the app.
- Tablet 820–1023px: still uses the mobile drawer + mobile filter row (unchanged) — already spacious.
- Mobile <768px: completely unaffected.

