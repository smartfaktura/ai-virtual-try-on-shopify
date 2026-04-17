

## Audit: Dashboard `/app` h2 consistency

Compared all four section headings on the dashboard.

| Section | h2 size | Subtitle | Wrapper |
|---|---|---|---|
| **Start here** (Dashboard.tsx:343) | `text-2xl` (no responsive) | ❌ none | `space-y-4` |
| **Steal the Look** (DashboardDiscoverSection.tsx:180) | `text-xl sm:text-2xl` | ✅ `mt-1.5` | — |
| **Create Video** (Dashboard.tsx:406) | `text-xl sm:text-2xl` | ✅ `mt-1.5` | `space-y-4` |
| **Your Products, In Motion** (Dashboard.tsx:452) | `text-xl sm:text-2xl` | ✅ `mt-1.5` | `space-y-3` ⚠️ |

### Inconsistencies found
1. **"Start here" h2 size** — uses flat `text-2xl`; the other three use `text-xl sm:text-2xl`. On mobile it renders larger than the rest.
2. **"Start here" has no subtitle** — the other three each have a one-line muted description. Creates an asymmetric rhythm down the page.
3. **"Your Products, In Motion" wrapper** — uses `space-y-3` instead of `space-y-4`. Slightly tighter gap between heading block and the video grid.

### Standard to align to
- h2: `text-xl sm:text-2xl font-bold text-foreground tracking-tight`
- Subtitle: `text-base text-muted-foreground mt-1.5`
- Wrapper: `space-y-4`

### Proposed fix
- `src/pages/Dashboard.tsx:343` — change `text-2xl` → `text-xl sm:text-2xl`, and add a short subtitle ("Pick a workflow and start creating.") so the rhythm matches the other three sections.
- `src/pages/Dashboard.tsx:450` — change `space-y-3` → `space-y-4`.

### Out of scope
- `VideoShowcaseSection` (landing page only — different scale by design).
- Other dashboard sub-components not using h2 section headers.

### Acceptance
- All four `/app` section headings render identical font size at every breakpoint.
- All four have a subtitle with identical spacing (`mt-1.5`).
- Vertical gap between heading block and content grid is the same (`space-y-4`) for all four.

