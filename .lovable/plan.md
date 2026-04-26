# Footer Refinement Plan

Edit `src/components/landing/LandingFooter.tsx` only. Keep the existing aesthetic (bg-card, border, typography). No new components.

## Changes

### 1. Tighter vertical rhythm
- Reduce list item spacing: `space-y-2.5` → `space-y-2`.
- Reduce link line-height: add `leading-snug` to each link.
- Reduce outer padding slightly: `pt-20 pb-10` → `pt-16 pb-8`.
- Reduce column-heading bottom margin: `mb-4` → `mb-3.5`.
- Reduce grid row gap on mobile: `gap-10` → `gap-8` (keep `md:gap-8`).

### 2. Better column balance
The Product column has 8 items while Legal has 3 — visually unbalanced. Rebalance:
- Move **Pricing** out of Product into a more prominent spot (keep in Product but it stays — the imbalance is mostly heading length). Instead:
- Promote a 5-column desktop layout that allocates Brand 3 cols + 5 link cols × ~1.8 cols each, but trim Product to 7 by moving **Visual Studio** label rename only (no removal needed).
- Real fix: change desktop grid from `md:grid-cols-12` with `col-span-4` brand + `col-span-8` links to `md:grid-cols-6` with `md:col-span-2` brand + `md:col-span-4` for the 5 link columns wrapping in a `grid-cols-5` inside. Use `items-start` so unequal column heights don't visually distort.
- Add Legal items: include **Bug Bounty** (`/bug-bounty` exists) and **Cookie Settings** placeholder removed — only add Bug Bounty to bring Legal to 4 items, balancing better.

### 3. Softer, smaller social icons
- Change icon size: `h-5 w-5` → `h-[18px] w-[18px]`.
- Wrap each in a subtle hover chip: `inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors`.
- Reduce gap between icons: `gap-4` → `gap-2`.

### 4. Highlight directory link
- In **Solutions**, replace the plain "All categories" item with a visually distinct final entry rendered outside the `<ul>` map as a styled "directory" link:
  - Label: **"All AI Photography Categories →"**
  - Style: `mt-3 inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition-colors` with a thin top divider (`pt-3 border-t border-border/60`).
- Implementation: render the Solutions column with a custom footer block under the standard list rather than via the generic map. Cleanest approach: keep the map for the first 7 items, then render the directory link as a sibling element. Refactor the column rendering to allow a per-column `footer` slot, OR detect `heading === 'Solutions'` and append the directory anchor — use the second (smaller diff).

### 5. Crawlable anchors
- All link rows currently use react-router `<Link>`, which renders `<a href>` — already crawlable. No change needed for SEO crawlers; confirm in the diff.
- Social icons already use `<a href>` — keep.
- Convert nothing to buttons.

### 6. Mobile collapse
Current mobile grid: `grid-cols-2` on the inner link grid → 5 columns wrap awkwardly into 2 cols × 3 rows of mismatched heights, producing a tall block.
- Change inner link grid mobile breakpoint: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` → `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` (unchanged structure) BUT:
- On `< sm` (mobile), wrap each column in a `<details>` accordion (native, crawlable, links remain in DOM):
  ```tsx
  <details className="sm:hidden border-b border-border/60 py-3" >
    <summary className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] cursor-pointer">
      {heading}
      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
    </summary>
    <ul className="mt-3 space-y-2">…</ul>
  </details>
  <div className="hidden sm:block">…existing column…</div>
  ```
- Native `<details>` keeps links in the DOM (crawlable) while collapsing the visual block. Brand/social area stays visible above.

### 7. Bottom bar
- No change to copyright/“A product by 123Presets” line, but reduce `mt-16 pt-8` → `mt-12 pt-6`.

## Technical Notes
- Single file edit: `src/components/landing/LandingFooter.tsx`.
- Add `ChevronDown` to existing `lucide-react` import.
- No new dependencies, no schema changes, no route changes.
- Bump `public/version.json` patch version after the edit.
- Verify with `tsc --noEmit` (no behavioral changes expected).

## Out of Scope
- Other footers (`HomeFooter.tsx`) — unchanged.
- Adding new pages or routes.
- Visual redesign of bg/border colors.
