

## /app/products — mobile UX refactor

Scope: `src/pages/Products.tsx` only. Mobile-first reorder + visual polish. Desktop layout stays untouched (`sm:` breakpoint).

### New mobile order (top → down)
1. Title + subtitle (already PageHeader — tighten only via existing `space-y-4` → keep)
2. **Search** (full width)
3. **Add Products** — full-width primary CTA (mobile only)
4. **Tools row** — single horizontal row: `[view toggle] [All Types] [Newest first]`

Desktop (`sm+`) keeps current 2-row layout: search/CTA on right, filters below.

### Implementation in `src/pages/Products.tsx` (lines 237–324)

Replace the toolbar block with a mobile-aware structure:

```tsx
<div className="space-y-3 sm:space-y-4">
  {showToolbar && (
    <>
      {/* Row 1: Search — full width on all sizes, capped on desktop via flex */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-11 sm:h-10" />
        </div>
        {/* Desktop-only inline CTA + view toggle (preserves current desktop layout) */}
        <div className="hidden sm:flex items-center gap-2">
          {/* existing view toggle + Add Products button */}
        </div>
      </div>

      {/* Mobile-only primary CTA — full width, dominant */}
      {products.length > 0 && (
        <Button onClick={() => openAddDrawer('manual', undefined, false)} className="sm:hidden w-full h-11 text-sm font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Add Products
        </Button>
      )}

      {/* Tools row — view toggle + filters in one line */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center border rounded-md shrink-0">
          {/* view toggle buttons (h-9 w-9 each) */}
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="flex-1 sm:flex-none sm:w-[160px] h-9 text-xs">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          {/* items unchanged */}
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
          <SelectTrigger className="flex-1 sm:flex-none sm:w-[150px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          {/* items unchanged */}
        </Select>
        {/* active filter badge + clear (unchanged) */}
      </div>
    </>
  )}
  {/* products grid — unchanged */}
</div>
```

### Key details
- **Mobile CTA**: `sm:hidden w-full h-11` — single dominant action below search.
- **Desktop CTA**: hidden on mobile via `hidden sm:flex` wrapper — keeps current right-aligned look.
- **Tools row**: view toggle moves into the same row as filters (`flex items-center gap-2 flex-wrap`). On mobile the two Selects use `flex-1` so they share the remaining width evenly next to the icon-only view toggle. On desktop they revert to fixed widths.
- **Search input**: `h-11` on mobile (bigger tap target), `sm:h-10` on desktop.
- **Spacing rhythm**: `space-y-3` on mobile (tighter, ~12px), `sm:space-y-4` on desktop.
- Modal already opens as a bottom Drawer on mobile (verified in `AddProductModal`) — context preserved, no redirect.
- No change to product grid, empty state, or non-mobile behavior.

### Acceptance
- Mobile `/app/products`: order is Title → Search → full-width Add Products → tools row (toggle + 2 filters in one line)
- Add Products visually dominates above filters on mobile
- Desktop layout unchanged
- Filters + view toggle align on one row on mobile (flex-wrap fallback if too narrow)
- Drawer opens on tap (already wired)

