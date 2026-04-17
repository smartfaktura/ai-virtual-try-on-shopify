

## Bump dashboard h2 titles + add more breathing room between sections

User wants the section headings on `/app` to feel a bit larger and the gap between sections to be more generous.

### Current standard (just unified)
- h2: `text-xl sm:text-2xl font-bold tracking-tight`
- Subtitle: `text-base text-muted-foreground mt-1.5`
- Between sections: whatever the parent `<main>` wrapper provides (likely `space-y-8` or similar)

### Change
Bump headings one step on each breakpoint, and add explicit larger margin-top on each section so the rhythm is roomier.

**New heading standard:**
- h2: `text-2xl sm:text-3xl font-bold tracking-tight`
- Subtitle: keep `text-base text-muted-foreground mt-1.5` (unchanged — still reads as supportive copy, not competing)

**New inter-section spacing:**
- Increase the parent stack on `/app` from current spacing to `space-y-12 sm:space-y-16` (or add `mt-10 sm:mt-14` per section if parent uses gap utilities that can't be tweaked centrally).

### Files to edit
1. `src/pages/Dashboard.tsx` — update three h2s ("Start here", "Create Video", "Your Products, In Motion", "More tools") + bump the outer wrapper spacing.
2. `src/components/app/DashboardDiscoverSection.tsx` — update "Steal the Look" h2 (line 180) to match.

### Acceptance
- All five/six section headings render at `text-2xl sm:text-3xl` — visibly larger but still subordinate to any page-level h1.
- Vertical gap between one section's content and the next section's heading is noticeably more generous on both mobile and desktop.
- All headings remain perfectly consistent in size, weight, tracking, and subtitle spacing.
- No layout breakage on 390px mobile (current viewport).

