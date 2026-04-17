
## Goal
Frontend-only text sweep to fix all P0 terminology leaks identified in the audit. Replace user-visible "Workflows / Templates" with **Visual Studio** (destination) or **Visual Types** (selectable options). No routes, props, types, or backend touched.

## Scope (text-only edits)

### 1. `src/pages/HelpCenter.tsx` — heaviest regression (10 strings)
| Line | Current → Replace |
|---|---|
| 31 | "across Workflows and Freestyle" → "across Visual Studio and Freestyle" |
| 40 | "Workflows cost 6 credits per image" → "Visual Types cost 6 credits per image" |
| 48 | "run your first Workflow or try Freestyle" → "run your first Visual Type or try Freestyle" |
| 61 | category name "Workflows & Generation" → "Visual Studio & Generation" |
| 64 | "What Workflows are available?" → "What Visual Types are available?" |
| 65 | "seven core Workflows, each pre-configured…" → "seven core Visual Types, each pre-configured…" |
| 77 | "Workflows support batch generation… choose a workflow… in the Workflows activity section." → "Visual Studio supports batch generation… choose a Visual Type… in the Visual Studio activity section." |
| 81 | "select your Templates, and set a schedule" → "select your Visual Types, and set a schedule" |
| 102 | "Try different workflows — some work better…" → "Try different Visual Types — some work better…" |

### 2. `src/components/landing/LandingPricing.tsx` (2 strings)
- Line 110: "Templates cost 6, Freestyle costs 4." → "Visual Types cost 6, Freestyle costs 4."
- Line 123: "Pick products and templates, set a schedule…" → "Pick products and Visual Types, set a schedule…"

### 3. `src/pages/AppPricing.tsx` (2 strings)
- Line 66: matrix group title "Brand & workflow" → "Brand & studio"
- Line 655: "depending on the workflow — product, lifestyle…" → "depending on the Visual Type — product, lifestyle…"
- Line 92 (Brand Model pricing FAQ): **leave as-is for now** — flagged separately as P1 for product confirmation.

### 4. `src/components/app/CreativeDropWizard.tsx` (1 string)
- Line 125: `STEP_LABELS = ['Details', 'Products', 'Workflow', 'Launch']` → `'Visual Type'`

## Out of scope (intentionally untouched)
- `src/pages/Changelog.tsx` — historical entries describing the product at time of release; preserved as record
- Routes, redirects, props, types, file/component names, DB columns
- Admin pages
- P1 factual conflicts (six vs seven, TryShot 60 credits, Brand Model price) — separate plan after product decisions
- P2 polish (e-commerce hyphenation, sign-in wording) — separate sweep

## Acceptance
- Zero user-visible "Workflows / Templates" referring to the visual creation feature in HelpCenter, LandingPricing, AppPricing, CreativeDropWizard
- No layout, logic, routing, or pricing changes — text only
- ~15 strings updated across 4 files
