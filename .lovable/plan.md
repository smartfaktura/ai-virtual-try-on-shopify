

## `/app/workflows` cleanup — remove "Learn how" + align to dashboard standards

### Part 1: Remove "Learn how" links

**File:** `src/components/app/WorkflowCardCompact.tsx` (lines 171-179)

Remove the entire `<Link to="/app/learn/visual-studio/...">Learn how →</Link>` block under the Start button. Also drop the now-unused `Link` import and the surrounding `space-y-1.5` wrapper (Button can sit alone in `pt-1 mt-auto`).

### Part 2: Branding & consistency audit on `/app/workflows`

Compared against the standards we just unified on `/app`. Issues found:

| # | Issue | Where | Current | Standard (from /app) |
|---|---|---|---|---|
| 1 | **Page title smaller than dashboard h1** | `PageHeader.tsx:24` | `text-2xl sm:text-3xl` | Dashboard h1 = `text-3xl sm:text-4xl` |
| 2 | **Subtitle smaller** | `PageHeader.tsx:29` | `text-sm sm:text-base mt-2` | Dashboard = `text-lg mt-2` |
| 3 | **Section heading "CHOOSE WHAT TO CREATE"** uses tiny uppercase label | Workflows.tsx:508 | `section-label` (tiny caps) | Dashboard sections use real `text-2xl sm:text-3xl font-bold` h2s with subtitle |
| 4 | **"Recent Creations" heading** uses tiny uppercase label inline with hr line | Workflows.tsx:586 | `section-label` + divider line + ghost "View All" | Dashboard "Recent Jobs" = full h2 + subtitle, then content directly |
| 5 | **Section spacing too tight** | Workflows.tsx:14, 496, 584 | `space-y-6`, `mt-6` between sections | Dashboard = `space-y-12 sm:space-y-16` |
| 6 | **Card title sizes inconsistent** | WorkflowCardCompact.tsx:144 | `text-sm` (or `text-[11px]` mobile) | Dashboard cards = `text-lg font-bold` |
| 7 | **Card description tiny** | WorkflowCardCompact.tsx:154 | `text-xs ... line-clamp-3` | Dashboard cards = `text-sm leading-relaxed` |
| 8 | **Button heights too small** | WorkflowCardCompact.tsx:164 | `h-8` | Dashboard CTAs = `min-h-[44px]` |
| 9 | **Button labels inconsistent** across the page | rows: "Create Set", grid: "Start Creating", mobile: "Start", "View All" | mix | Dashboard standard = "Open" (or here: settle on **"Start Creating"** consistently across rows + grid) |
| 10 | **Invalid Tailwind class `w-4.5 h-4.5`** | WorkflowRequestBanner.tsx:49 | silent fallback | use `w-5 h-5` (same bug we fixed on dashboard) |
| 11 | **Card radius inconsistent** | Card defaults vs dashboard `rounded-2xl` | mixed | Standardize on `rounded-2xl` for grid cards |

### Proposed changes

**A. `src/components/app/PageHeader.tsx`**
- h1: `text-2xl sm:text-3xl` → `text-3xl sm:text-4xl font-bold tracking-tight`
- subtitle: `text-sm sm:text-base mt-2` → `text-base sm:text-lg mt-2`
- Outer wrapper: `space-y-6` → `space-y-12 sm:space-y-16`

**B. `src/pages/Workflows.tsx`**
- Replace tiny "CHOOSE WHAT TO CREATE" label (line 507-510) with proper h2 block:
  ```
  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Choose what to create</h2>
  <p className="text-base text-muted-foreground mt-1.5">Pick a Visual Type to start a new set.</p>
  ```
- Replace "Recent Creations" tiny label + hr (lines 583-595) with proper h2 + subtitle + "View All" ghost button on the right (mirroring dashboard pattern).
- Drop the standalone `mt-6` on Recent block since parent `space-y-12` handles spacing.

**C. `src/components/app/WorkflowCardCompact.tsx`**
- Remove the "Learn how" link block (lines 171-179) and unused `Link` import.
- Bump default (non-mobile, non-modal) variant to dashboard card scale:
  - Padding: `p-4` → `p-5`
  - Title: `text-sm` → `text-base font-bold` (keep tracking-tight)
  - Description: `text-xs` → `text-sm leading-relaxed`
  - Button: `h-8 px-5` → `h-10 px-5` (better touch target)
  - Card root: ensure `rounded-2xl`
- Mobile compact + modalCompact variants: leave as-is (intentionally dense).

**D. `src/components/app/WorkflowCard.tsx`** (rows layout)
- Button label "Create Set" → "Start Creating" (consistent with grid view).
- h2 already `text-xl lg:text-2xl` — keep.

**E. `src/components/app/WorkflowRequestBanner.tsx`**
- Replace `w-4.5 h-4.5` with `w-5 h-5` (line 49).

### Out of scope
- Activity card internal layout (separate component, not affecting page rhythm).
- Mobile compact and 3-col grid card densities — they're intentionally tighter.
- The toggle layout switcher in the header actions — works fine.

### Acceptance
- No "Learn how" links anywhere on `/app/workflows`.
- Page h1 + subtitle visually match `/app` dashboard h1 + subtitle.
- Section headings ("Choose what to create", "Recent Creations") match dashboard h2 standard (`text-2xl sm:text-3xl`, with subtitle).
- Vertical breathing room between sections matches dashboard (`space-y-12 sm:space-y-16`).
- Default grid cards have larger title + description + button, in line with dashboard cards.
- All workflow CTAs say "Start Creating".
- No invalid Tailwind classes left in the page tree.

