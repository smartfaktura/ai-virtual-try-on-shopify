

# Improve Dashboard Metrics, Move Tip Card, Add Feedback Section

## Changes

### 1. `src/components/app/MetricCard.tsx` — Add team avatar branding

Add optional `avatarUrl` prop. When provided, show a small team avatar (24x24 rounded-full) next to the icon in the top-right corner, replacing the plain icon box with a more branded feel:

```tsx
interface MetricCardProps {
  // ...existing
  avatarUrl?: string;
}
```

When `avatarUrl` is set, render the avatar as the card's visual identity element instead of the icon-in-colored-box. Show a small avatar circle with a subtle ring, and place the icon inline with the title text instead. This gives each metric a "team member owns this" feel.

Layout update: slightly increase padding (`p-6`), add `gap-1` between title and value for breathing room.

### 2. `src/pages/Dashboard.tsx` — Wire avatars to metrics

Import team avatar URLs (Sophia for Images, Omar for Credits, Luna for Products, Kenji for Schedules) and pass `avatarUrl` to each `MetricCard`:

- Images Generated → Sophia (photographer)
- Credits Remaining → Omar (CRO strategist)
- Products → Luna (refinement)
- Active Schedules → Kenji (campaign director)

### 3. `src/pages/Dashboard.tsx` — Move DashboardTipCard after Steal This Look

Currently the tip card ("Zara · New Feature") sits before LowCreditsBanner (line 453). Move it to right after `<DashboardDiscoverSection />` (line 494), before `<FeedbackBanner />`.

Order becomes: Metrics → Steal This Look → TipCard → FeedbackBanner → Recent Creations → ...

### 4. `src/pages/Dashboard.tsx` — Add Feedback section at the very bottom

After `<UpcomingDropsCard />` (line 650), add the `<FeedbackBanner />` as the last section. Remove it from its current position (line 497). This puts "Help us improve VOVV.AI" at the bottom of the dashboard as the final call-to-action.

Wait — user says "move Zara notification after Steal This Look" AND "add feedback to last section". So:
- Move `<DashboardTipCard />` from line 453 to after `<DashboardDiscoverSection />`
- Move `<FeedbackBanner />` from line 497 to after `<UpcomingDropsCard />` (very last)

### Files
- `src/components/app/MetricCard.tsx` — add `avatarUrl` prop, improve spacing
- `src/pages/Dashboard.tsx` — wire avatars, reorder TipCard and FeedbackBanner

