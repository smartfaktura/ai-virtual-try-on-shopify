## Two issues to fix

### 1. Layout doesn't fit
The admin page uses a 3-column grid (`260px | 1fr | 320px`) inside the AppShell content area. The right "details" rail crowds the center column, slot cards squish to one column and big buttons overflow. The whole page feels cramped.

### 2. Saved override not appearing on the live page
The DB has the override saved correctly:
```
/ai-product-photography · heroTile10 · scene amber-glow-studio-3
```
But `src/components/seo/photography/PhotographyHero.tsx` still renders a hardcoded list and never calls `useSeoVisualOverridesMap` / `resolveSlotImageUrl`. The wiring step from the original plan was never completed for this component, so overrides are saved but not consumed.

---

## Fix

### A. Redesign admin layout (`src/pages/admin/SeoPageVisuals.tsx`)

Drop the right details rail. Move its info into a compact summary card at the top of the center column. Switch to a clean 2-column layout that breathes:

```
[ 240px sidebar ] [ flexible main with 2/3/4/5-col card grid ]
```

- Left aside: page list (unchanged content, slightly tighter).
- Main column:
  - Top: summary card with page label, route, "X/Y configured", "Open live page" button.
  - Below: sections with thumbnail grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3`.
- Cards: smaller, image-first, label + 1-line "where it appears", icon-only Reset / Use-fallback buttons + "Change" text button. Status badge ("Set" / "Fallback" / "Unsaved") sits on the thumbnail.
- Sticky save bar, picker modal, and confirm dialogs remain unchanged.

Result: cards stop squishing, the page looks like a real CMS grid, and the right rail no longer competes for space.

### B. Wire `PhotographyHero` to consume overrides

In `src/components/seo/photography/PhotographyHero.tsx`:

1. Import `useSeoVisualOverridesMap` and `resolveSlotImageUrl`.
2. Inside the component, call `const overrides = useSeoVisualOverridesMap();`.
3. Map each tile to its slot key (`heroTile1` … `heroTile12`) using its index, and resolve the URL:
   ```ts
   const src = resolveSlotImageUrl(
     overrides,
     '/ai-product-photography',
     `heroTile${index + 1}`,
     PREVIEW(tile.id),
   );
   ```
4. Use the resolved URL inside `<Tile>` instead of the hardcoded `tile.src`.

If the override map is empty (no admin changes, or fetch fails), the original PREVIEW URL is used → SEO output is unchanged. If an override exists, the new image renders.

### C. (Follow-up, not in this fix)

Other SEO components (`CategoryHero`, scene examples, comparison pages, etc.) still need the same one-line wiring. Once this hero works end-to-end we can repeat the pattern for the remaining slots in a separate pass.

---

## Files changed

- `src/pages/admin/SeoPageVisuals.tsx` — layout redesign (2-col, denser card grid, summary card replaces right rail).
- `src/components/seo/photography/PhotographyHero.tsx` — read overrides and resolve each hero tile URL.
