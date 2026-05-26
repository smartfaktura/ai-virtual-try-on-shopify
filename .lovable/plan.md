UX polish on the Setup (Generate) step in `src/components/app/product-images/ProductImagesStep4Review.tsx`. Presentation-only; no logic, no state, no functional change.

**1. Format & Output card — restructure header**
- Remove the `Settings2` icon from the card header.
- Promote `Format & Output` to a larger card title (`text-base font-semibold tracking-tight`) on its own line.
- Add a small helper underneath: `Pick the formats and how many images per scene`.

**2. Format control — bigger pills, cleaner label**
- Remove the awkward inline `Format` + `Select one or more` + `RatioShape` row. Replace with: bold `Format` label on its own line + a smaller helper `Choose one or more aspect ratios`.
- Bump ratio buttons from `px-3 py-1.5 text-xs` → `px-4 py-2.5 text-sm` with `rounded-xl`. Arrange as a responsive grid: `grid grid-cols-3 sm:grid-cols-6 gap-2` so each format becomes a real card-pill.
- Keep selected state (filled `bg-primary text-primary-foreground border-primary`), inactive state subtle (`bg-muted/40 border-border/60`).
- Keep the small ratio glyph inside each pill (left of label).

**3. Images per scene — matching style**
- Remove the `ImageIcon` sub-icon.
- Bold `Images per scene` label + helper `Select how many images to generate per scene`.
- Render the 1 / 2 / 3 / 4 options in the same enlarged pill style as the format pills (reuse the same button classes; bypass `ChipSelector` here for visual consistency).

**4. Layout rebalance after Quality removal**
- Switch the inner grid from `md:grid-cols-3` to a vertical stack: Format full-width row → thin divider → Images per scene full-width row. Gives each control breathing room now that Quality is gone.

**5. Advanced Scene Controls — its own section**
- Move the `Advanced Scene Controls` collapsible OUT of the Format & Output card into a sibling `Card` directly below it.
- Same no-icon treatment: card title `Advanced Scene Controls` (`text-base font-semibold tracking-tight`) + helper `Fine-tune format and props for individual scenes`. Keep the chevron + collapsible body identical.

**6. Remove decorative icons across Setup summary cards**
- `N Products` card: drop `Package` icon, bump title to `text-base font-semibold`.
- `N Scenes` card: drop `Layers` icon, same title bump.
- `Credits` card: drop `Coins` icon, same title bump.
- Edit ghost buttons stay as-is.

Files touched: only `src/components/app/product-images/ProductImagesStep4Review.tsx`.