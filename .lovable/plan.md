

# Match "More tools" cards to dashboard card style

## Summary
Restyle the 3 "More tools" cards to match the "Start here" and "Create Video" card design — same rounded-2xl, p-6, icon sizing, typography, hover effects, and button style.

## Changes

**File: `src/pages/Dashboard.tsx` (lines 470-488)**

For each tool card, update from the current compact utility style to match the dashboard card pattern:

| Property | Current | Updated |
|----------|---------|---------|
| Container | `border-border/60 rounded-xl p-5` | `rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300` |
| Icon box | `w-8 h-8 bg-muted/50`, icon `w-4 h-4 text-muted-foreground` | `w-10 h-10 rounded-lg bg-primary/10 mb-4`, icon `w-5 h-5 text-primary` |
| Title | `text-sm font-semibold` | `text-lg font-bold` |
| Muted label | inline `text-[11px]` next to title | keep as `text-xs text-muted-foreground/60 mt-3` below description (like "Best place to start" pattern) |
| Description | `text-sm mt-1` | `text-sm text-muted-foreground mt-1.5 leading-relaxed` |
| Button | `variant="outline" size="sm"` | `variant="outline" className="w-full rounded-full font-semibold gap-2 mt-3 min-h-[44px]"` with ArrowRight icon |
| Layout | `flex flex-col gap-3` | `flex flex-col` with flex-1 wrapper around text content |

