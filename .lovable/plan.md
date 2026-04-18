

## Bigger, more readable Metric Cards

### Root cause
`MetricCard` is undersized for the dashboard grid:
- Title: `text-[10px] sm:text-xs` — barely readable on mobile
- Value: `text-base sm:text-xl` (16/20px) — visually weak
- Suffix: `text-xs` — too quiet
- Card height: `100px / 140px` with `p-2.5 sm:p-5` padding
- Border radius `rounded-xl` — inconsistent with sibling dashboard cards (`rounded-2xl`, `p-6`)

This makes the metrics row feel like a secondary toolbar, not a confident headline row.

### Change — `src/components/app/MetricCard.tsx`

Bump to a more generous, design-system-aligned card:

| Token | Before | After |
|---|---|---|
| Container | `rounded-xl p-2.5 sm:p-5 h-[100px] sm:h-[140px]` | `rounded-2xl p-4 sm:p-6 min-h-[120px] sm:min-h-[160px]` |
| Border | `border-border/40` | `border-border` (matches Start-here cards) |
| Hover | `hover:border-border/80 hover:shadow-sm` | `hover:border-primary/30 hover:shadow-lg transition-all duration-300` (matches Start-here / More-tools cards) |
| Icon | `w-3 h-3 sm:w-3.5 sm:h-3.5` | `w-4 h-4` |
| Title | `text-[10px] sm:text-xs font-medium` | `text-sm font-medium` |
| Title gap to value | `mt-1.5 sm:mt-2` | `mt-3` |
| **Value** (the big number) | `text-base sm:text-xl font-bold` | `text-3xl sm:text-4xl font-bold` (matches credit pill `text-2xl` and dashboard headings; commands attention) |
| Suffix / body | `text-xs text-muted-foreground/70` | `text-sm text-muted-foreground mt-2 leading-relaxed` |
| Description (no-value variant: "No recent workflow", "Generate to discover") | `text-sm font-medium` | `text-xl sm:text-2xl font-bold text-foreground leading-tight` (so it visually ranks as a "value", not body copy) |
| Loading skeletons | small bars | match new heights (`h-4 w-20`, `h-9 w-28`, `h-4 w-32`) |
| Trend pill | `text-xs` | unchanged, but bumped `mt-2` |

### Mobile grid spacing
In `src/pages/Dashboard.tsx` line 575: keep `grid-cols-2 md:grid-cols-3 lg:grid-cols-5` but bump gap from `gap-2 sm:gap-4` → `gap-3 sm:gap-4` so the larger cards breathe properly on mobile.

### Acceptance
- Numbers (€30, 0h, 48) appear at `text-3xl`/`text-4xl` — clearly the visual hero of each card, in line with the credit pill in the sidebar.
- Titles ("Cost Saved", "Time Saved", "Credits") readable at `text-sm` on mobile (no more 10px).
- Cards visually match the "Start here" / "More tools" cards: `rounded-2xl`, hover lift, primary-tinted border on hover.
- No-value cards ("No recent workflow", "Generate to discover") read as proper headlines instead of muted body text.
- Loading skeletons resize to prevent layout shift.

