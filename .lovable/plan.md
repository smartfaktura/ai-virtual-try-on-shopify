## Add "Brand Models" CTA card to /home model showcase

Insert one minimal, luxury-styled "Brand Models — Create your own" card into both rows of the `Professional models. Every look.` section. Card matches the landing page monochrome aesthetic.

### Design
- Same dimensions as model cards (`w-28/32/36 × h-36/40/44`, `rounded-2xl`)
- Inverted aesthetic: `bg-foreground text-background` (so it stands out as intentional, not broken)
- Centered: thin circular plus icon, then "BRAND MODELS" in two lines (uppercase, tracked `0.18em`), then tiny "Create your own" subtitle
- Subtle scale on hover for the icon ring
- Caption below reads "Custom" (italic, muted) instead of a name
- Wrapped in `<Link to="/app/models">`

### Implementation
In `src/components/landing/ModelShowcaseSection.tsx`:
1. Add a `BrandModelCTA` component with the styled card.
2. Change `MarqueeRow`'s `items` type to a discriminated union (`{kind:'model'} | {kind:'cta'}`) and render either component.
3. In `ModelShowcaseSection`, prepend `{ kind: 'cta' }` to both `row1` and `row2` so the card appears in each marquee.

No other files touched. No new dependencies.

**Approve to apply.**