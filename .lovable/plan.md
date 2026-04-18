
## Fix `/app/admin/ui-audit` — priority pass

Address the critical issues identified: fabricated paths, mocked components, broken search, and missing real tokens.

### Changes (single file: `src/pages/AdminUIAudit.tsx`)

**1. Replace mocks with real components**
- Import and render real: `WorkflowCardCompact`, `FreestylePromptCard`, `ImageLightbox` (trigger-only), `PageHeader`, sidebar group label from `AppShell`.
- For surfaces that require heavy props/context (generation phase card, library asset card, activity card), keep a labelled mock but mark it clearly with a `[mock]` chip — no fake "Used in" path.

**2. Verify every "Used in" path**
- Grep-check every path string against the codebase. Remove or correct any that don't resolve.
- Replace fabricated names (`LibraryAssetCard`, `ActivityCard`) with real file paths found via search, or drop the annotation.

**3. Fix search + sticky toolbar**
- Wire the `query` state into `AuditSection` so filtering actually hides non-matching blocks (match against title, anchor, tailwind classes, used-in paths).
- Fix sticky toolbar z-index/offset so it doesn't overlap the TOC or section anchors.
- Fix anchor scroll offset (account for sticky header height via `scroll-mt-*`).

**4. Move Inconsistencies to top + add severity**
- Promote the Inconsistencies section directly under the page header.
- Add severity tags (`high` / `med` / `low`) per entry with color-coded chips.
- Add "Show only inconsistencies" filter toggle in the toolbar.

**5. Real design-token section**
- Add a Tokens section reading actual CSS variables from `:root` via `getComputedStyle(document.documentElement)`:
  - Brand/surface colors: `--background`, `--foreground`, `--primary`, `--brand`, `--surface`, `--surface-subdued`, `--surface-hovered`, `--surface-pressed`, `--surface-selected`, `--card`, `--popover`, `--muted`, `--border`, `--input`, `--ring`, `--destructive`.
  - Render as swatches with the resolved HSL value displayed.
- Add Inter font-weight ladder (300/400/500/600) with computed `font-weight` readout.
- Add full Tailwind spacing scale (`gap-1` through `gap-12`) with computed pixel values.

**6. Self-consistency pass**
- Audit the audit page: replace its own ad-hoc status pills with the same `Badge` variants it documents, so it stops contradicting itself.

### Out of scope
- No refactor into per-section files (defer; can be a follow-up).
- No new routes, no backend, no schema changes.

### Acceptance
- Search filters blocks live by name/path/class.
- "Show only inconsistencies" toggle works.
- Inconsistencies section sits at top with severity chips.
- Real `WorkflowCardCompact` and `FreestylePromptCard` render in the workflow surfaces section.
- Every `<UsedIn>` path resolves to a real file (verified by grep).
- Tokens section shows live CSS variable values from the DOM.
- No regressions; page remains admin-only.

### File touched
- `src/pages/AdminUIAudit.tsx`
