
## Phase 2 + 3 — Sweep `/app` to one consistent visual system

Goal: make every `/app` page feel like one app — same spacing, same chips, same cards, same muted text — without changing the aesthetic. Use the canonical decisions already locked in Phase 1.

### What gets standardized

**1. Page rhythm (every `/app/*` route)**
- Every page wraps content in `<PageHeader title=... subtitle=...>` → guarantees same top spacing, same `space-y-8 sm:space-y-10` between sections, same h1 size.
- Sweep pages currently using raw `<h1>` or custom wrappers: `/app/freestyle`, `/app/library`, `/app/discover`, `/app/workflows`, `/app/video/*`, `/app/admin/*`, `/app/learn`, `/app/billing`.

**2. Cards (one radius, one padding scale)**
- All app cards → `<Card density="comfortable|compact|dense">` (radius now `rounded-2xl` by default from Phase 1).
- Normalize: `WorkflowCardCompact`, `FreestylePromptCard`, dashboard metric cards, library asset card, activity card, pricing cards, admin table-row cards.
- Remove ad-hoc `p-4`/`p-6`/`rounded-xl` overrides.

**3. Muted text — single token**
- Replace `text-foreground/60`, `/70`, `/80` → `text-muted-foreground` across `src/`.
- Done file-by-file with visual verification on key pages.

**4. Section labels — single class**
- Replace ad-hoc `text-xs uppercase tracking-wider text-muted-foreground` → `.section-label`.
- Hits: settings panels, admin sub-headers, sidebar groups, freestyle setting groups.

**5. Status pills — `<StatusBadge>` only**
- Replace inline colored pills (amber/green/red bg+text combos) in: library cards, video hub, trend watch, generation activity, admin tables.
- `<Badge>` reserved for neutral chips (BETA, count, "New").

**6. Buttons — `<Button>` only in app chrome**
- Replace raw `<button class="h-X px-Y …">` patterns in `AppShell` user menu, send buttons, freestyle action buttons → `<Button variant size>`.
- Chip-style triggers (e.g. `FreestyleSettingsChips`) stay as-is — they're a deliberate variant; documented in audit.

**7. Dividers**
- `<Separator />` for content separation; structural rows keep `border-b border-border`.
- Remove `.section-divider::after` custom CSS usages.

**8. Confirmations**
- Migrate scattered `Dialog`-based "Are you sure?" flows → `<ConfirmDialog>` (built in Phase 1).
- Targets: delete product, delete model, clear library, cancel subscription, etc.

**9. Skeletons**
- Replace 2 known shimmer-div patterns with `<Skeleton>`.

**10. Spacing rhythm (verify, don't reinvent)**
- Section internal: `space-y-4`. Form fields: `space-y-2`. Button groups: `gap-2`. Chip rows: `gap-2` (desktop) / `gap-1` (mobile).

### Execution

Done in waves to keep diffs reviewable:

**Wave A — Page shells (visible structural unification)**
Wrap every top-level `/app/*` page in `<PageHeader>`. Single largest visual win.

**Wave B — Cards & status pills**
Apply `density` prop, swap inline pills for `<StatusBadge>`. Touches the most-visited surfaces (Library, Workflows, Video Hub, Discover).

**Wave C — Muted text + section labels + dividers**
Mechanical sweep across `src/`. Verified per file.

**Wave D — Buttons + confirmations + skeletons**
App chrome buttons, confirm flows, shimmer cleanup.

**Wave E — Audit page sync**
Tick off each resolved inconsistency in the Phase 1 progress tracker on `/app/admin/ui-audit` so progress is visible.

### Out of scope
- No color/typography/font change.
- No new components beyond what Phase 1 already added.
- No marketing/landing page changes.
- No backend, no schema changes.

### Acceptance
- Every `/app` page uses `<PageHeader>` → identical top spacing + section rhythm.
- Zero `text-foreground/{60,70,80}` left in `src/`.
- Zero inline status pills outside `StatusBadge`.
- All app cards use `density` prop (or default), all `rounded-2xl`.
- Confirmations route through `ConfirmDialog`.
- Audit page progress bar shows the resolved inconsistencies.
- Visual diff: tighter, more uniform — but no aesthetic shift.

### Files touched (estimate)
- ~8–12 page files for `PageHeader` wrapping
- ~6–10 component files for card density + status pills
- ~15–25 files for muted-text/section-label sweep
- 3–5 confirmation flows migrated
- `src/pages/AdminUIAudit.tsx` (progress sync)
