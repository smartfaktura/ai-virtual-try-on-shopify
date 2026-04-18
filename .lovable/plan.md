
The user is frustrated — global primitive changes aren't enough because many buttons across `/app` have hardcoded class overrides (`h-11`, `h-12`, `rounded-full`, `rounded-md`, `px-6`, custom font sizes) that bypass the new defaults. I need to do a real sweep.

Let me scope what I know:
- Dashboard hero CTAs use `min-h-[44px] rounded-full` inline → these are intentional pills
- Sidebar pills are bespoke (white-bg shimmer) → leave alone
- Page-header CTAs (like "Add Products") should be `size="pill"` → already done for one
- Form/modal buttons should be default `h-10 rounded-lg` → done at primitive level
- BUT countless pages override with `h-11`, `rounded-full`, etc.

I need to:
1. Grep the entire `/app` surface for hardcoded button height/radius overrides
2. Categorize each by intent (page-header CTA → pill, form/modal → default, sidebar/special → leave)
3. Strip overrides so they inherit, OR convert to `size="pill"` for hero CTAs
4. Same audit for inputs/selects/textareas (less common to override)

Plan:

### The real problem
Global primitive defaults are correct now, but ~50+ buttons across the app hardcode `h-11`, `h-12`, `rounded-full`, `px-6`, `text-base` etc. directly via `className`, which overrides the defaults. Same applies to inputs/selects in some places.

We need a **codebase sweep** — not more primitive tweaks.

### Standard (locked in)
| Element | Spec |
|---|---|
| Page-header / hero CTA | `size="pill"` → `h-10 rounded-full px-5` |
| Standard button (forms, modals, toolbars) | default → `h-10 rounded-lg px-4` |
| Small button (chips, table actions) | `size="sm"` → `h-8 rounded-lg` |
| Input / Select / Textarea | `h-10 rounded-lg px-3.5 text-sm` |
| Sidebar pills, CreditIndicator, special shimmer CTAs | **leave untouched** (intentional) |
| Dashboard 6 hero cards (`min-h-[44px]`) | **leave** (oversized for empty-state cards by design) |

### Sweep plan

**Step 1 — Audit (grep)**
Find all override patterns:
- `<Button ... className="...h-11..."` / `h-12` / `h-9` (when not `sm`)
- `<Button ... className="...rounded-full..."` (likely should be `size="pill"`)
- `<Button ... className="...rounded-md..."` (force-downgrade from new default)
- `<Button ... className="...px-6..."` / `px-8`
- `<Input/Select/Textarea ... className="...h-11..."` / `h-12` / `rounded-full`

Scope: `src/pages/**`, `src/components/app/**`, `src/components/ui/**` (exclude `button.tsx`, `input.tsx`, `select.tsx`, `textarea.tsx` themselves).

**Step 2 — Triage each hit**
- Page-header / "primary action on page" → convert to `size="pill"`, strip height/radius/padding overrides, keep `font-semibold`/`shadow-*`/`gap-*`
- Form/dialog/inline action → strip `h-11`/`h-12`/`rounded-full`/`px-6`/`text-base`, let default apply
- Already-correct exceptions (sidebar, CreditIndicator, dashboard 6 hero cards, auth pages, marketing/landing) → **skip**
- Inputs/selects with override → strip to inherit defaults

**Step 3 — Apply**
Bulk edits across files. Estimated 30-60 file touches, mostly 1-3 lines each.

**Step 4 — Verify**
After edits, re-grep for the same patterns to confirm zero leftovers (excluding the explicit skip-list).

### Skip-list (intentional, do not touch)
- `src/components/app/AppSidebar*.tsx` — bespoke white-bg pills with shimmer
- `src/components/app/CreditIndicator.tsx` — Top-up pill
- `src/pages/Dashboard.tsx` — 6 hero CTAs use `min-h-[44px]` inside large empty-state cards (intentional one notch larger than `pill`)
- `src/pages/Landing*.tsx` / marketing — public pages, not `/app`
- `src/pages/Auth.tsx` / signup / login — separate visual context

### Files (estimate)
~30-50 files in `src/pages/app/**` and `src/components/app/**`. I'll list them after the audit grep.

### Acceptance
- `grep -r "h-11\|h-12\|rounded-full\|rounded-md\|px-6\|px-8\|text-base" src/pages src/components/app | grep "<Button\|className"` returns only the skip-list
- Visual scan of `/app/products`, `/app/library`, `/app/freestyle`, `/app/workflows`, `/app/brand-profiles`, `/app/discover`, `/app/perspectives`, `/app/catalog`, `/app/video/*`, `/app/learn`, modals, settings → all CTAs visually consistent (pill for headers, lg for inline)
- Form inputs / selects / textareas all `h-10 rounded-lg`
