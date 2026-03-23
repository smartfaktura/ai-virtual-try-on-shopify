

# Clean Up Metric Cards: Modern Minimal, No Avatars

## Changes

### 1. `src/components/app/MetricCard.tsx`

Remove the `avatarUrl` prop and all avatar rendering logic. Simplify to a clean, modern minimal card:

- Remove `avatarUrl` from props and destructuring
- Remove the avatar `<img>` branch (lines 39-40)
- Keep only the small icon inline with the title (left side) — no icon box on the right either
- Remove the duplicate icon rendering (currently icon appears both in title row AND in the colored box)
- Final layout: icon + title on one line, big number below, optional suffix, optional trend, optional progress bar

```text
┌──────────────────────────┐
│  📦 Products             │
│  12  in library          │
│  ━━━━━━━━░░░░            │
└──────────────────────────┘
```

Clean, no visual clutter — just the data.

### 2. `src/pages/Dashboard.tsx` (lines 458-492)

Remove all `avatarUrl` props from the 4 MetricCard instances. Remove the `getLandingAssetUrl` avatar imports if no longer used elsewhere in this file.

### Files
- `src/components/app/MetricCard.tsx` — remove avatarUrl, simplify to minimal layout
- `src/pages/Dashboard.tsx` — remove avatarUrl props from metric cards

