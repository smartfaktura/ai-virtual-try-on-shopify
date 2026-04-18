

## Polish /app/products header + flatten subtitle

### Issue
The Products page subtitle "Upload once, reuse across every Visual Type" feels visually flat — same muted body weight as everywhere else, no hierarchy or hint of context. User wants it more dimensional.

### Approach — keep the rule (no period) but add quiet richness

Update `PageHeader` usage in `src/pages/Products.tsx` (line 233-236) to use a **rich subtitle** pattern: split the line into a primary value statement and a secondary, even-quieter detail, with an inline product count when products exist.

**Before:**
```tsx
subtitle="Upload once, reuse across every Visual Type"
```

**After (concept):**
```tsx
subtitle={
  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
    <span className="text-foreground/80 font-medium">Upload once</span>
    <span className="text-muted-foreground">— reuse across every Visual Type</span>
    {products.length > 0 && (
      <>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
        <span className="text-xs text-muted-foreground/80">
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </span>
      </>
    )}
  </span>
}
```

This requires `PageHeader` to accept `ReactNode` for `subtitle` (likely already does — will verify). If it's typed as `string`, widen to `string | ReactNode`.

### Why this works
- Two-tone subtitle creates visual rhythm without breaking the minimalist rule.
- Primary half (`Upload once`) reads at `foreground/80 font-medium` — gives it weight.
- Secondary half stays muted — keeps luxury restraint.
- Tiny dot separator + count badge adds a real-time data signal, replacing flatness with utility.
- No trailing period (memory rule preserved).

### Files
- `src/pages/Products.tsx` — replace `subtitle` prop with rich JSX node, move `products` query above `PageHeader` render (already is).
- `src/components/app/PageHeader.tsx` — verify/widen `subtitle?: string` to `string | React.ReactNode` if needed.

### Acceptance
- `/app/products` subtitle no longer reads as a single muted line — has a clear "headline + supporting detail + product count" rhythm.
- When products = 0, the count chip is hidden (no "0 products" noise).
- No period at end.
- Mobile wraps gracefully via `flex-wrap`.

