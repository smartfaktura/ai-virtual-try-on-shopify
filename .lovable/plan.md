

## Internal UI Style Audit page (`/app/admin/ui-audit`)

A single, scrollable, admin-only page that renders **the actual components** currently used across the app — labelled with their variant names, sizes, and source — so we can spot inconsistencies before standardizing.

### Route + access
- New route in `src/App.tsx`: `/admin/ui-audit` → `<AdminUIAudit />`.
- New page: `src/pages/AdminUIAudit.tsx`. Guarded with `useIsAdmin()` → `<Navigate to="/app" />` for non-admins (same pattern as `AdminFeedback`).
- Sidebar/user-menu link in `AppShell.tsx` user dropdown: "UI Style Audit" (admin-only chunk that already lists other admin links).

### Page architecture
- Use existing `PageHeader` + a sticky in-page TOC (left rail on desktop, top tabs on mobile) jumping to each section.
- Each section is wrapped in a small reusable local component `<AuditSection title="..." anchor="..." />` and `<AuditSpec label="..." value="..." />` for the metadata table beside each example.
- Each example block renders **the live component** + a side panel listing: variant name, file source (e.g. `components/ui/button.tsx`), tailwind classes, computed font-size / line-height / radius (read from a small helper that uses `getComputedStyle` on a hidden ref → display real px values, not assumptions).

### Sections (in order)

1. **Typography** — render h1–h4, body lg/md/sm, caption, label, helper, muted, button text, badge text. Pull samples from real usage (e.g. `PageHeader` title, dashboard stat label, `Label` component, `text-muted-foreground` paragraph). Show computed px size/weight/line-height/letter-spacing via the helper.

2. **Buttons** — every variant from `components/ui/button.tsx` (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) × every size (`default`, `sm`, `lg`, `icon`) + loading (with `Loader2`), disabled, and **non-standard buttons** found in the wild (e.g. custom `bg-primary` buttons in `AppShell`, freestyle send button). Side-by-side grid for easy comparison.

3. **Inputs / form controls** — `Input`, `Textarea`, `Select`, `Combobox` (if present), `Switch`, `Checkbox`, `RadioGroup`, search input pattern, `Label` + helper text + error state.

4. **Cards / containers** — `Card`, `card-elevated`, `card-luxury`, `metric-card`, `template-card`, `generation-preview`, modal content block (`DialogContent`), empty state container, list row container. Render each with a sample child + spec panel (radius, shadow, padding, bg).

5. **Badges / chips / status pills** — all `Badge` variants + `.status-badge--success/warning/critical/info` from `index.css` + any inline pill patterns found.

6. **Layout & spacing** — visual ruler cards showing real values used: page padding (`PageHeader` wrapper), section gap, card padding (`p-3` / `p-4` / `p-5` / `p-6`), grid gap, form field gap, title→subtitle, subtitle→content, button group gap, badge→text gap. Each rendered as a labelled spacer block (e.g. `gap-4 = 16px` with a coloured 16px box).

7. **Borders / radius / shadows** — swatches for every border color token (`--border`, `--input`), divider styles, radius scale (`sm`, `md`, `lg`, `xl`, `2xl`, `full`), shadow scale (`shadow-sm`, `shadow`, `shadow-md`, `card-elevated`, `metric-card:hover`), and surface layers (`--background`, `--surface`, `--surface-subdued`, `--surface-hovered`, `--surface-pressed`, `--surface-selected`, `--card`, `--popover`, `--muted`).

8. **Page structure patterns** — render mini mock-ups: page header (title + subtitle + actions), section header, empty state layout, list/grid wrapper, modal header/body/footer, sidebar group label.

9. **Inconsistencies / likely duplicates** — a manually-curated, expandable list (data-driven array at top of file so we can grow it). Each entry: title, the two variants side-by-side, why they conflict, suggested unification. Seeded entries from what I've already seen in the codebase:
   - **3+ card paddings in active use**: `p-3`, `p-4`, `p-5`, `p-6` across `WorkflowCardCompact`, `FreestylePromptCard` (just normalized), dashboard cards, admin tables.
   - **Two button height conventions**: shadcn `Button` (`h-10` / `h-9` / `h-11`) vs ad-hoc `<button class="h-10 px-3 ...">` in `AppShell` user menu.
   - **Three "muted text" styles**: `text-muted-foreground`, `text-foreground/60`, `text-foreground/80`.
   - **Two "section label" styles**: `.section-label` (uppercase tracking-widest) vs `text-xs text-muted-foreground` headers.
   - **Two badge systems**: shadcn `<Badge>` vs `.status-badge--*` CSS classes.
   - **Radius drift**: `rounded-md` (default), `rounded-lg`, `rounded-xl`, `rounded-2xl` mixed on similar surfaces (cards vs pills).
   - **Two divider patterns**: `border-b border-border` vs `.section-divider::after`.
   - **Two heading scales**: `PageHeader` title vs raw `<h1 class="text-2xl">` in some admin pages.

### Helper utilities (inline, in the same file to keep it self-contained)
- `useComputedStyle(ref, props[])` — returns real computed px values for the spec panels.
- `<SwatchBox color="hsl(var(--border))" label="--border" />`
- `<RadiusBox radius="rounded-xl" />`
- `<ShadowBox className="shadow-md" label="shadow-md" />`
- `<SpacerBox size={16} label="gap-4" />`

### Files touched
- **New**: `src/pages/AdminUIAudit.tsx` (~600–800 lines, all sections inline; no backend, no new components in `components/ui`).
- **Edited**: `src/App.tsx` — add lazy import + route.
- **Edited**: `src/components/app/AppShell.tsx` — add "UI Style Audit" link inside the existing admin user-menu block.

### Out of scope (per constraints)
- No actual component refactors / unification yet — this is purely visibility.
- No database, no edge functions, no new shadcn components.
- No mobile-first redesign of the audit page itself — desktop-first with basic responsive stacking.

### Acceptance
- Admin can navigate to `/app/admin/ui-audit` from the user menu.
- Non-admin users get redirected to `/app`.
- Page renders all 9 sections with live component examples + spec panels showing real computed values.
- "Inconsistencies" section visibly shows side-by-side duplicates with notes.
- No regressions in any existing route.

