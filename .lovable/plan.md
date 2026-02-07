

## Dashboard Visual Overhaul: Studio Infrastructure + Luxury Feel

### The Problem

Looking at the screenshot, the dashboard has three issues working against the "luxury studio" feel:

1. **Shopify Green is still the primary color everywhere.** The sidebar active state, sidebar logo background, CTA buttons, and the user avatar all use `161 100% 25%` (green). This creates a cheap SaaS vibe instead of a studio feel.

2. **Flat, generic card layout.** Every section is a white card with identical padding, identical borders, identical text sizes. There's no visual hierarchy -- the welcome message looks the same weight as the checklist which looks the same as the workflow cards.

3. **No warmth or texture.** The background is a cool gray (`210 20% 98%`), borders are cool-toned, and there's no spacing rhythm that suggests a curated, premium environment.

---

### What Changes

**Phase 1: Apply the Studio Infrastructure Color System (src/index.css)**

This replaces the entire Shopify Green palette with the approved color system from the ChatGPT spec:

| Token | Current (Green SaaS) | New (Studio) |
|---|---|---|
| `--background` | `210 20% 98%` (cool gray) | `40 10% 98%` (warm stone #FAFAF9) |
| `--foreground` | `212 14% 15%` | `222 47% 11%` (#0F172A slate-900) |
| `--primary` | `161 100% 25%` (GREEN) | `217 33% 17%` (#1E293B dark blue) |
| `--ring` | `161 100% 25%` (green) | `217 33% 17%` (brand blue) |
| `--secondary` | `210 14% 95%` | `40 7% 94%` (#F1F1EF warm) |
| `--muted` | `210 14% 95%` | `40 7% 94%` |
| `--muted-foreground` | `212 10% 45%` | `215 16% 47%` (#475569) |
| `--border` | `210 14% 89%` | `40 6% 88%` (warm neutral) |
| `--destructive` | `0 72% 51%` | `0 72% 35%` (#991B1B deeper) |
| `--status-success` | `161 60% 35%` (green) | `215 25% 27%` (#334155 dark slate) |
| `--status-warning` | `40 85% 50%` | `19 83% 34%` (#9A3412) |
| `--surface-selected` | `161 70% 95%` (green tint) | `220 29% 92%` (#E8EBF1) |
| `--sidebar-background` | `212 14% 12%` | `222 47% 11%` (#0F172A deepened) |
| `--sidebar-primary` | `161 100% 45%` (green) | `210 17% 70%` (muted steel) |
| `--sidebar-ring` | `161 100% 45%` | `217 33% 17%` |
| `--accent-highlight` | `161 100% 25%` | `217 33% 17%` |

Also updates dark mode block and removes all "Shopify Polaris" / "Shopify Green" comments. Updates status badge classes from `bg-green-*` to `bg-slate-*`.

**Phase 2: Remove Shopify color group from Tailwind config (tailwind.config.ts)**

Remove the entire `shopify: { green, blue, purple, yellow, orange }` color block since those CSS variables no longer exist.

**Phase 3: Dashboard Layout Refinements (src/pages/Dashboard.tsx)**

Transform the flat card stack into a layered studio hierarchy:

**First-Run Dashboard changes:**
- Welcome section: Remove the Card wrapper. Instead, render a full-width welcome block with larger typography (text-2xl for name, tracking-tight), the credit count as a subtle pill, and the "Buy Credits" button styled as a minimal outlined link. This creates a breathing, premium opening.
- Onboarding checklist: Keep the Card wrapper but add a subtle left border accent (`border-l-2 border-primary`) on incomplete steps to draw the eye down the path.
- "Two Ways to Create" section heading: Change from `text-base` to `text-lg` with `tracking-tight` for more weight.
- Workflow grid: Add a subtle muted background band behind the workflow section to create depth separation.

**Returning User Dashboard changes:**
- MetricCards: No structural change but the color shift (green to dark blue) automatically gives them a more serious tone.
- Quick Create section heading: Same typography upgrade.

**Phase 4: Onboarding Checklist Polish (src/components/app/OnboardingChecklist.tsx)**

- Add step number styling: the `01`, `02`, `03` numbers become larger (`text-sm` with `font-semibold`) using the primary color to create a visual anchor.
- Completed steps get a softer checkmark treatment: instead of `text-primary` (which was green, now dark blue), use a more subtle completion indicator.
- Add a thin progress bar at the top of the card showing completion (0/3, 1/3, etc.) as a slim `bg-primary` bar.

**Phase 5: Generation Mode Cards Polish (src/components/app/GenerationModeCards.tsx)**

- Icon containers: Change from `bg-secondary` (flat gray) to a more refined `bg-primary/5 border border-primary/10` for a subtle branded tint.
- Add a thin top border on each card in the primary color (`border-t-2 border-primary`) for visual anchoring.
- Credit cost text: Style as a discrete pill (`bg-muted rounded-full px-2 py-0.5`) instead of inline text.

**Phase 6: Fix Hardcoded Green References (3 files)**

1. `src/components/app/StatusBadge.tsx` -- Change `bg-green-100 text-green-800` to `bg-slate-100 text-slate-800`
2. `src/components/app/CreditIndicator.tsx` -- Change `text-yellow-600` and `bg-yellow-500/10 border-yellow-500/30` to use the new warning tokens: `text-amber-800` and `bg-amber-900/10 border-amber-900/20`
3. `src/components/app/BulkProgressTracker.tsx` -- Change any `bg-green-*` to `bg-slate-*`

---

### Files Modified (8 total)

| File | Action | Purpose |
|---|---|---|
| `src/index.css` | Edit | Full CSS variable replacement: green to Control Blue, warm stone backgrounds, studio-grade status colors |
| `tailwind.config.ts` | Edit | Remove `shopify` color group |
| `src/pages/Dashboard.tsx` | Edit | Layout refinements: breathing welcome block, section typography, visual hierarchy |
| `src/components/app/OnboardingChecklist.tsx` | Edit | Progress bar, step number styling, completion polish |
| `src/components/app/GenerationModeCards.tsx` | Edit | Branded icon containers, top border accent, credit cost pills |
| `src/components/app/StatusBadge.tsx` | Edit | Green to slate for success status |
| `src/components/app/CreditIndicator.tsx` | Edit | Yellow to amber-brown for warning state |
| `src/components/app/BulkProgressTracker.tsx` | Edit | Green to slate for completed items |

---

### What This Achieves

- **No more green anywhere.** The entire app shifts to a warm neutral base with a single dark-blue accent.
- **Warm stone backgrounds** (#FAFAF9) instead of cool clinical gray -- feels like a photo studio, not a SaaS admin.
- **Visual hierarchy in the dashboard** -- the welcome area breathes, the checklist draws you through steps, the workflow grid has depth.
- **Luxury restraint** -- fewer borders, more typography weight, branded accents used sparingly. Product visuals remain the most colorful elements.

