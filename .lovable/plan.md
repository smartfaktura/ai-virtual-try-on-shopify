

## Polish Discover sub-category bar — coherent hierarchy, no redundancy, identical on `/discover` and `/app/discover`

Three issues to fix together:

### 1. "All Bags & Accessories" reads redundant

The sub-bar's first pill currently builds `All ${familyLabel}`, producing **"All Bags & Accessories"** — which already says "all" twice in spirit and stutters next to the active *Bags & Accessories* family pill above it.

Fix: replace the labeling rule with a clean **"All"** pill (no family name repeated). Context is already obvious from the highlighted family chip directly above it. Same treatment as Apple/Vercel-style nested filter rails.

```text
Before:   [Bags & Accessories]            ← family
          [All Bags & Accessories] [Bags] [Backpacks] …

After:    [Bags & Accessories]            ← family
          [All] [Bags] [Backpacks] [Belts] [Scarves] …
```

### 2. "Text on text" — sub-bar lacks visual hierarchy

Today the sub-bar pills sit on the same page background with a faint `border-border/40` outline and lowercase muted text — visually they read as a second, equally-weighted row of pills, fighting the dark family pill above. There is no spatial cue that they're a *child* of the family selection.

Fix — three small moves:

1. **Tighten vertical rhythm**: pull the sub-bar 4px closer to the family bar (`-mt-1` on its wrapper inside the page; remove the parent `space-y-8` gap for this pair specifically — wrap family + sub bars in one `<div className="space-y-2.5">`).
2. **De-emphasize the pills**: drop the border, switch to a subtle filled style. Inactive = `bg-muted/30 text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground`. Active = `bg-foreground/10 text-foreground` (a quiet inverse of the family's solid `bg-foreground text-background`). This creates a clear weight ladder: **solid → tinted → ghost**.
3. **Indent + smaller scale**: `pl-1` on the sub-row container and keep pills slightly smaller (`px-3 py-1 text-[11px]`) so they read as secondary controls, not equals.

Result: family bar is the loud level-1 selector, sub bar is a quiet level-2 refinement — no more "text-on-text" feeling.

### 3. `/discover` ≠ `/app/discover` spacing

Root cause: `/app/discover` (`Discover.tsx`) renders inside `AppShell` with one outer container, while `/discover` (`PublicDiscover.tsx`) renders inside `PageLayout` with its own `max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8`. The `space-y-8` gap on the public page pushes the sub-bar much further from the family bar than on the app page.

Fix: in BOTH pages, group the family bar + sub bar inside a single `<div className="space-y-2.5">…</div>` so the parent `space-y-*` no longer separates them. Then the spacing between family and sub rows is identical on both surfaces, regardless of the outer rhythm.

### Files touched

```text
EDIT  src/components/app/DiscoverSubCategoryBar.tsx
        - First pill label: 'All' (drop family name)
        - Pill style: bg-muted/30 inactive, bg-foreground/10 active, no border
        - Smaller scale: px-3 py-1 text-[11px], gap-1
        - Container: pl-1 to indent under family bar

EDIT  src/pages/Discover.tsx
        - Wrap <DiscoverCategoryBar/> + <DiscoverSubCategoryBar/> in
          <div className="space-y-2.5"> so they hug

EDIT  src/pages/PublicDiscover.tsx
        - Same wrapper grouping for identical rhythm
```

No DB, no edge function, no taxonomy changes.

### Validation

1. `/app/discover` → click *Fashion*: sub-row appears tightly under the family row (~10px gap), pills are visibly secondary (lighter, smaller, no border). First pill reads **"All"**, not "All Fashion".
2. Same on `/discover` — spacing now matches `/app/discover` exactly.
3. *Bags & Accessories* sub-row reads: **All · Bags · Backpacks · Belts · Scarves · Hats · Wallets · Eyewear** — no redundant "All Bags & Accessories".
4. Active sub-pill (e.g. *Hoodies*) is clearly distinguishable from inactive ones but visibly subordinate to the solid black *Fashion* family pill above.
5. Single-sub families (Watches, Tech, Wellness) still hide the sub-row entirely (existing `isMultiSubFamily` guard unchanged).

