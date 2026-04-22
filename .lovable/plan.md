

## Make mobile Filters drawer feel spacious

The mobile Filters drawer currently reuses the same tiny desktop rows (text-xs, py-1.5). On a 390px viewport that feels cramped. Bump every row in mobile mode to a tap-friendly, pill-style item — same spirit as iOS Settings.

### Changes in `src/components/app/freestyle/SceneCatalogSidebar.tsx`

When `mobileMode` is on:

1. **Row sizing** — apply a "mobile" variant inside `renderRow` and the family button:
   - Height ≈ `h-12` (currently ~28px) via `py-3`.
   - Font: `text-sm` (was `text-xs`).
   - Padding: `px-4` (sub-rows `pl-10 pr-4`).
   - Shape: `rounded-xl` for a softer, more modern pill block.
   - Icons: `w-4 h-4` (was `w-3.5`).
   - Count badge: `text-xs` (was `text-[10px]`), still tabular.
   - Row gap: `space-y-1` instead of `space-y-0.5`.

2. **Section labels** ("Quick", "Product Families")
   - `pt-5 pb-2 px-4 text-[11px]` on mobile so they breathe under the drawer header.

3. **Drawer container padding**
   - Mobile: `px-3 py-3` → `px-3 py-4` (one extra row of breathing room).
   - Add `pb-[max(1rem,env(safe-area-inset-bottom))]` on the inner `<div>` so the bottom of a long families list isn't hidden behind the iOS home indicator.

4. **Active state**
   - Keep `bg-primary/10 text-primary font-semibold` — already correct, just larger now.

Desktop layout (`mobileMode` undefined) is **unchanged** — same compact rows as today.

### Files touched

- `src/components/app/freestyle/SceneCatalogSidebar.tsx` — add a `mobileMode`-aware class set in `renderRow`, the family button, and the section label helper. No prop changes, no behavior changes.

### Untouched

`SceneCatalogModal.tsx`, `SceneCatalogFilters.tsx`, grid, hooks, RLS, sort_order logic, desktop sidebar.

### Validation (390 × 818)

- Open Scenes modal → tap **Filters** → drawer opens with noticeably larger, pill-shaped rows.
- Each row is easy to tap with a thumb — no more pinpoint targets.
- Section headers ("QUICK", "PRODUCT FAMILIES") have visible breathing room.
- Last family ("Wellness") sits above the iOS home indicator, not under it.
- Sub-family expansion (e.g. Fashion → Womenswear / Menswear) uses the same larger spacing.
- Desktop ≥ 1024px: unchanged.

