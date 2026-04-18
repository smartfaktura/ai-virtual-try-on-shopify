

## Improve "Start here" CTA labels on /app dashboard

### Issue
All three "Start here" cards use the generic "Open" CTA. User wants distinct, action-led labels per card.

### Plan — `src/pages/Dashboard.tsx` (lines 355, 372, 389)

Update only the button label text inside the three cards in the "Start here" grid:

| Card | Current CTA | New CTA |
|------|-------------|---------|
| Create Product Visuals | Open | **Start creating** |
| Create with Prompt (Freestyle Studio) | Open | **Open studio** |
| Explore Examples | Open | **Browse looks** |

No structural, styling, icon, or routing changes — just the label text inside each `<Button>`. Trailing `ArrowRight` icon kept.

Note: card #2's title is currently "Create with Prompt", not "Freestyle Studio" as the user referenced — only the CTA changes; title stays as-is unless the user asks otherwise.

### Acceptance
- Three distinct, action-led CTAs on the dashboard "Start here" cards
- Same visual style, sizing, icons, routes
- No other dashboard sections touched

