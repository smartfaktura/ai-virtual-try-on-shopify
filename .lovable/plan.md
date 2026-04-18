

## /app/products — desktop toolbar refactor

Scope: `src/pages/Products.tsx` only. Desktop layout (`sm:` and up). Mobile stays as-is.

### Current problem
- Search left, filters below, view toggle + Add Products grouped right → feels disconnected
- Add Products visually clumped with grid/list toggle (utility) instead of being the page-level primary action
- Two-row toolbar with awkward empty space

### New desktop structure (3 rows)

```
┌─────────────────────────────────────────────────────────┐
│ Products                                  [+ Add Products] │   ← Header row (PageHeader actions slot)
│ Upload once and reuse across every Visual Type           │
├─────────────────────────────────────────────────────────┤
│ [🔍 Search products........................]   [▦ ☰]  │   ← Toolbar row
├─────────────────────────────────────────────────────────┤
│ [All Types ▾]  [Newest first ▾]                         │   ← Filter row
└─────────────────────────────────────────────────────────┘
   product grid (unchanged)
```

### Implementation

**1. Move desktop "Add Products" into PageHeader `actions` slot** (`src/pages/Products.tsx`)
- `PageHeader` already supports an `actions` prop rendered top-right next to the title
- Pass the Add Products button via `actions={<Button …>Add Products</Button>}` for `sm:` and up
- Hide it inside the toolbar block on desktop (was previously grouped with view toggle)
- Mobile full-width CTA below search stays unchanged (`sm:hidden`)

**2. Restructure toolbar block (lines ~237–324)**

Desktop layout becomes:
```tsx
{/* Toolbar row: search (left) + view toggle (right) */}
<div className="hidden sm:flex items-center justify-between gap-3">
  <div className="relative w-full max-w-md">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input placeholder="Search products..." className="pl-9 h-10" />
  </div>
  <div className="flex items-center border rounded-md shrink-0">
    {/* grid / list toggle — h-9 w-9, ghost styling, no border accent */}
  </div>
</div>

{/* Filter row: selects only, left-aligned */}
<div className="hidden sm:flex items-center gap-2">
  <Select>…All Types…</Select>
  <Select>…Newest first…</Select>
  {/* active filter badge + clear (unchanged) */}
</div>
```

Mobile keeps current layout (search → full-width Add Products → unified tools row with toggle+filters).

**3. Reduce visual weight of view toggle**
- Use lighter border (`border-border`) and ghost button styling so it reads as utility, not action
- Keep `h-9 w-9` icon-only buttons

**4. Spacing & alignment**
- Wrapper: `space-y-3 sm:space-y-3` (tighter rhythm on desktop too — was `sm:space-y-4`)
- All toolbar rows align to the same left edge as the product grid (no `max-w` shifts)
- Search input width: `max-w-md` on desktop (was `max-w-sm`) — fills more of the row, removes empty floaty feel
- Heights unified: search `h-10`, selects `h-10` (bumped from `h-9`), toggle `h-10` wrapper containing `h-9 w-9` buttons
- PageHeader subtitle margin already tight (`mt-1.5`) — no change needed

### Acceptance
- Desktop: Add Products lives in the header row next to the title, separated from the grid/list toggle
- Toolbar row = search left + view toggle right, on a single line
- Filter row = All Types + Newest first, left-aligned, on its own line
- All controls share consistent `h-10` height
- Search input visibly wider, eliminating empty space
- Mobile layout unchanged (already approved)
- Product grid untouched

