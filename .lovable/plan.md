
## Design unification pass — keep the look, kill the drift

Goal: standardize the *system* without changing the *aesthetic*. Lock canonical tokens for the patterns the audit page exposed, then sweep the codebase to use them.

### Strategy
Don't redesign — **codify what already looks right**, retire what doesn't, and make the wrong choice impossible going forward.

### Canonical decisions (from audit findings)

**1. Cards — one padding scale, one radius**
- Canonical: `rounded-2xl` + `p-5` (desktop) / `p-4` (mobile compact) / `p-3` (dense rows only).
- Retire: ad-hoc `rounded-lg`/`rounded-xl` on card surfaces, random `p-6`.
- Action: extend `<Card>` with `density` prop (`comfortable` | `compact` | `dense`) → maps to the 3 paddings. Update `card.tsx` default radius to `rounded-2xl`.

**2. Buttons — shadcn only**
- Canonical: `<Button variant size>` everywhere. No raw `<button class="h-10 px-3 …">`.
- Action: codemod-style sweep of `AppShell` user menu, send buttons, and any freestyle buttons → replace with `<Button>`. Add ESLint-style note in audit page header.

**3. Muted text — one token**
- Canonical: `text-muted-foreground`.
- Retire: `text-foreground/60`, `text-foreground/80`, `text-foreground/70`.
- Action: global find/replace across `src/`, verify visually on 5–6 key pages.

**4. Section labels — one class**
- Canonical: `.section-label` (uppercase, tracking-widest, `text-[10px]` muted).
- Retire: ad-hoc `text-xs uppercase tracking-wider text-muted-foreground` repeats.
- Action: ensure `.section-label` exists in `index.css`, sweep usages.

**5. Status — one source of truth**
- Canonical: `<StatusBadge>` for job/library/video/trend states. `<Badge>` only for neutral chips (BETA, Coming Soon, count).
- Retire: inline `bg-amber-50 text-amber-900` pills, `.status-badge--*` CSS classes (fold into `StatusBadge`).
- Action: extend `StatusBadge` config to cover library (Draft/Brand Ready/Publish), trend, video. Delete `.status-badge--*` from `index.css`.

**6. Headings — `PageHeader` only**
- Canonical: every page route renders title via `<PageHeader>`. No raw `<h1 class="text-2xl">` in pages.
- Action: sweep admin pages → wrap in `PageHeader`.

**7. Dividers — one pattern**
- Canonical: `<Separator />` for content, `border-b border-border` for structural rows.
- Retire: `.section-divider::after` custom CSS.

**8. Confirmation overlays — one rule**
- Canonical: `AlertDialog` for destructive confirms, `Dialog` for content/forms, `Sheet` for secondary panels (mobile becomes `Drawer` automatically via wrapper).
- Action: add a tiny `<ConfirmDialog>` wrapper around `AlertDialog` so we stop reinventing it; audit existing `Dialog` confirmations and migrate.

**9. Skeletons — one component**
- Canonical: `<Skeleton>` only. Retire shimmer divs in lists.
- Action: replace 2 known shimmer patterns.

**10. Spacing rhythm — locked scale**
- Canonical: page `space-y-8 sm:space-y-10` (already in `PageHeader`); section internal `space-y-4`; form fields `space-y-2`; button groups `gap-2`.
- Action: document in audit page; no code change unless drift found.

### Execution plan (3 phases, no visual redesign)

**Phase 1 — Tokens & primitives (low risk, high leverage)**
- Update `card.tsx`: default `rounded-2xl`, add `density` prop.
- Extend `StatusBadge` to absorb library/trend/video states.
- Confirm/clean `.section-label` in `index.css`; remove `.status-badge--*` CSS.
- Add `<ConfirmDialog>` wrapper.

**Phase 2 — Sweep (mechanical replacements)**
- Replace `text-foreground/60|70|80` → `text-muted-foreground` (verify per file).
- Replace ad-hoc status pills → `<StatusBadge>`.
- Replace raw `<button>` in app chrome → `<Button>`.
- Replace ad-hoc section labels → `.section-label`.

**Phase 3 — Page-level normalizations**
- Wrap admin pages without `PageHeader` → use `PageHeader`.
- Normalize card paddings on `WorkflowCardCompact`, `FreestylePromptCard`, dashboard cards, admin tables to the 3-step density scale.
- Migrate stray `Dialog` confirmations → `ConfirmDialog`.

### Audit page updates (tracking)
- Add a "Canonical vs Deprecated" column to each Inconsistency entry showing the **chosen winner** + a Done/Todo checkbox state (local state, not persisted).
- Add a top-of-page progress bar: "X / Y inconsistencies resolved" computed from the same list.

### Out of scope
- No new visual language, no color palette change, no font change.
- No new shadcn components beyond the `ConfirmDialog` thin wrapper.
- No backend, no schema changes.

### Acceptance
- `card.tsx`, `StatusBadge.tsx`, `index.css` updated with canonical decisions.
- All `text-foreground/<opacity>` muted patterns replaced.
- Status pills unified through `<StatusBadge>`.
- Admin pages render via `PageHeader`.
- Audit page shows canonical winners + resolved/todo state per inconsistency.
- Visual diff on `/app`, `/app/workflows`, `/app/library`, `/app/discover`, `/app/admin/*` shows no aesthetic change — only consistency.

### Files touched (estimate)
- `src/components/ui/card.tsx`
- `src/components/app/StatusBadge.tsx`
- `src/index.css`
- `src/components/ui/confirm-dialog.tsx` (new, thin wrapper)
- `src/components/app/AppShell.tsx` (button + label sweep)
- `src/components/app/WorkflowCardCompact.tsx`, `FreestylePromptCard.tsx` (padding normalization)
- ~10–15 page/component files for muted-text + status-pill sweep
- `src/pages/AdminUIAudit.tsx` (canonical/deprecated annotations + progress)
