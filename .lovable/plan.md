
## Scope correction — just spacing & text sizing on `/app`

You're right, I overscoped. Let's drop the architectural rewrite and do exactly what you asked: tighten spacing and normalize text sizes across `/app`. No new components, no sweeps of 400 files, no confirmation migrations.

### What I'll actually do

**1. Spacing rhythm — one set of rules**
- Page top padding: same on every `/app` route (already from `PageHeader` where used; add to the 2-3 pages that skip it).
- Between sections: `space-y-8` (desktop) / `space-y-6` (mobile).
- Inside a section: `space-y-4`.
- Form fields: `space-y-2`. Button groups: `gap-2`.

**2. Text size ladder — locked**
- Page title (h1): `text-2xl sm:text-3xl font-bold` (matches `PageHeader`).
- Section title (h2): `text-lg font-semibold`.
- Card title: `text-base font-semibold`.
- Body: `text-sm`.
- Muted/meta: `text-sm text-muted-foreground`.
- Tiny label: `.section-label` (already exists).

**3. Where I'll apply it**
Visible `/app` surfaces only:
- `/app` (dashboard)
- `/app/workflows`
- `/app/library`
- `/app/discover`
- `/app/freestyle`
- `/app/video` hub
- `/app/billing`
- `/app/learn`

For each: align section spacing + normalize any one-off heading sizes to the ladder above. Nothing else changes — same colors, same components, same layouts.

### What I'm NOT doing (dropped from previous plan)
- No 414-instance text-color sweep
- No confirmation dialog migration
- No card density refactor across components
- No PageHeader wrapping of wizards
- No new files

### Acceptance
- All listed `/app` pages share identical top spacing and section gaps
- Headings on those pages follow the 5-step size ladder
- No visual redesign — only tighter, more uniform rhythm

### Files touched (~6-8)
- The page files listed above, small edits each (spacing classes + heading sizes)
