

## Reduce global section gaps (Dashboard + PageHeader)

### Root cause
A previous edit bumped major-section spacing from a moderate rhythm to `space-y-12 sm:space-y-16` (48–64px) in two places:

1. **`src/components/app/PageHeader.tsx`** (line 31) — affects every page using `PageHeader` (Library, Discover, Workflows, etc.) — gap between each direct child.
2. **`src/pages/Dashboard.tsx`** (lines 295, 308, 519) — root wrapper `<div className="space-y-12 sm:space-y-16">` controls gaps between Welcome → Metrics → Steal the Look → Tip Card → Recent Creations → Tools → Recent Jobs → FeedbackBanner.

64px between every major section feels excessive — this is what the user is calling out (gap before metric cards, after Steal the Look, after DashboardTipCard, before/after Recent Jobs, before FeedbackBanner).

### Change

**One global token bump** — reduce major-section rhythm from `space-y-12 sm:space-y-16` (48/64px) to `space-y-8 sm:space-y-10` (32/40px). This is still generous breathing room but feels rhythmic, not "huge gap."

Files:
1. `src/components/app/PageHeader.tsx` line 31 — `space-y-12 sm:space-y-16` → `space-y-8 sm:space-y-10`. Fixes Library, Discover, Workflows, and every other PageHeader-based page in one edit.
2. `src/pages/Dashboard.tsx` — three root wrappers (resolving state line 295, new-user state line 308, returning-user state line 519) — same swap.

Tightly-grouped subsections inside (`space-y-4`) stay untouched — they already behave correctly.

### Acceptance
- `/app` (Dashboard): noticeably tighter gaps before metric cards, between Steal the Look ↔ Tip Card ↔ Recent Creations ↔ Tools ↔ Recent Jobs ↔ FeedbackBanner. Still clearly separated, just not 64px.
- `/app/library`, `/app/discover`, `/app/workflows`: same rhythm reduction between major sections (e.g. before FeedbackBanner). Internal groupings (filters↔grid) unchanged.
- No layout breakage — pure spacing token reduction.

