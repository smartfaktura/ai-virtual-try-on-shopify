# Redesign landing footer (`LandingFooter.tsx`)

This is the footer rendered on every public landing page (used by `PageLayout`, including `/product-visual-library`). I'll keep it minimal/editorial to match the rest of the platform and fix the issues you flagged.

## Changes

**Brand block**
- Remove the small purple "V" tile icon entirely (matches `LandingNav` which is already wordmark-only).
- Make logo significantly larger: `text-3xl font-bold tracking-tight` (vs current `text-base` next to a 28px tile).
- Replace the tagline with: **"AI product visuals for e-commerce brands."** (constrained to `max-w-xs`).
- Bump social icon spacing from `gap-3` → `gap-4`, push down with `mt-6`.

**Link columns**
- Switch grid to `md:grid-cols-12`: brand takes 4 cols, links take 8 cols (4 sub-columns). This gives the brand block proper breathing room instead of being cramped at 1/5 width.
- Column headings: uppercase eyebrow style — `text-xs font-semibold uppercase tracking-[0.14em] text-foreground/90 mb-4` (matches the editorial eyebrow pattern used elsewhere on landing pages).
- Link rows: clean `text-sm text-muted-foreground` with `space-y-2.5` instead of the current `py-2` block links (which made the list feel oversized and uneven).

**Bottom bar**
- Bump copyright text from `text-xs` → `text-sm` so it's actually readable.
- Reformat the "A product by 123Presets" line into a proper sentence with **123Presets** rendered as a link (`text-foreground/80 hover:text-foreground`) — fixes the "looking strange" floating label.
- Increase top padding (`mt-16 pt-8`) so the divider doesn't feel cramped against the columns.

**Vertical rhythm**
- Outer footer padding: `pt-20 pb-10` (was `py-14`) — gives the section the same generous top breathing room as other landing sections.
- Column gap: `gap-10 md:gap-8`.

No changes to the link inventory, social URLs, or routing. Single file edit.

## File

- `src/components/landing/LandingFooter.tsx`
