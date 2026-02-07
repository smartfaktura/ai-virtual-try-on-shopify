

## Luxury Studio Visual Polish: Navigation + Dashboard

### What's Wrong Now

Looking at the screenshot, the dashboard reads as a generic SaaS admin panel, not a premium creative studio. Three specific problems:

1. **Sidebar is a dark slab.** The active state is barely visible (just a slightly lighter navy rectangle). There's no visual rhythm -- every nav item has the same weight. The logo area has no separation from navigation. The credit indicator at the bottom blends into the darkness.

2. **Dashboard content is flat.** Every card has the same border, same padding, same visual weight. The "Dashboard" page title and "Welcome, Tomas" compete for attention. The onboarding steps feel like a form, not a curated experience. There's no depth -- no shadows, no layering, no breathing room.

3. **Typography lacks hierarchy.** Section headings ("Get Started", "Two Ways to Create") are the same size and weight. The welcome greeting doesn't feel special. Numbers and labels in the credit pill don't stand out.

---

### Changes Overview

**7 files modified** to create a layered, premium studio feel:

---

### 1. Sidebar Elevation (AppShell.tsx)

Transform the sidebar from a flat dark slab into a refined studio panel:

- **Logo area**: Add a bottom border separator (`border-b border-white/5`) and increase padding for breathing room. The logo icon gets a subtle `bg-white/10` instead of `bg-primary` (which is the same dark blue on dark blue -- invisible).
- **Active nav state**: Replace the subtle background-only highlight with a **left accent bar** pattern: `border-l-2 border-white/60` on the active item, plus slightly brighter text (`text-sidebar-foreground` instead of `text-sidebar-primary`). This creates a clear "you are here" signal.
- **Hover states**: Add `hover:bg-white/5` for a softer, more refined hover instead of the current heavy `hover:bg-sidebar-accent`.
- **Section labels** ("MAIN", "CONFIGURATION"): Increase letter-spacing slightly and reduce opacity for true whisper-level hierarchy.
- **Credit indicator area**: Add a top border separator (`border-t border-white/5`) to create a distinct footer zone.

---

### 2. Top Header Refinement (AppShell.tsx)

- Remove the visible bottom border (`border-b border-border`). Instead, use a very subtle shadow (`shadow-[0_1px_0_0_rgba(0,0,0,0.04)]`) for a floating feel.
- User avatar: Change from `bg-primary` (dark block) to a refined `bg-foreground/10` with `text-foreground` for a softer, more sophisticated look.

---

### 3. Dashboard Page Structure (Dashboard.tsx)

**First-Run Dashboard:**
- Remove the heavy "Dashboard" PageHeader title entirely for the first-run view -- the welcome greeting IS the page header. This eliminates the competing titles problem.
- Welcome section: Upgrade to `text-3xl font-light` for the name (lighter weight = more luxury) with the greeting in `font-semibold`. Add a subtle decorative line separator below.
- Credit pill: Refine with `bg-foreground/5 border border-foreground/10` for a glass-like quality.
- "Buy Credits" button: Style as a ghost text link, not a bordered button -- luxury apps don't push purchases aggressively.
- Section headings: Consistent `text-sm font-semibold uppercase tracking-widest text-muted-foreground` treatment -- whisper-level labels that let content speak.
- Workflow grid section: Add more vertical spacing (`py-8`) and a very subtle top border instead of the current background band.

**Returning User Dashboard:**
- Same PageHeader removal in favor of a sleek greeting.
- Metric cards: Add `shadow-sm` for subtle lift.

---

### 4. Onboarding Checklist Polish (OnboardingChecklist.tsx)

- Card wrapper: Remove visible border, use `shadow-sm` instead for elevation.
- Progress bar: Thinner (h-0.5) and softer -- luxury is about restraint.
- Step items: Remove the heavy `border-l-2 border-primary/40` treatment. Instead, use subtle background differentiation: incomplete steps get `bg-transparent` with a hairline bottom border, completed steps get `bg-muted/30`.
- Step numbers: Change from `text-primary font-semibold` to `text-muted-foreground font-light text-lg` -- large, light numbers are more editorial.
- CTA buttons: Change from `variant="outline"` to `variant="ghost"` with an arrow -- less aggressive, more inviting.

---

### 5. Generation Mode Cards Polish (GenerationModeCards.tsx)

- Remove the `border-t-2 border-t-primary` top accent -- it reads as a UI framework default, not luxury.
- Instead, add `shadow-sm hover:shadow-md` for subtle depth on hover.
- Icon containers: Switch to `bg-foreground/[0.03] border-0` -- nearly invisible background, no border. Luxury is about absence.
- Credit cost pills: Softer -- `text-muted-foreground` instead of `text-foreground`.
- Primary CTA button ("Start Generating"): Keep as-is but ensure it's the only visually heavy element on the card.

---

### 6. Credit Indicator Sidebar Refinement (CreditIndicator.tsx)

- Remove the colored border treatment (`bg-primary/10 border-primary/30`). Replace with a clean `bg-white/5 border-0` that sits naturally in the dark sidebar.
- "Credits" label: Increase to `text-[11px]` and use `text-sidebar-foreground/40` for whisper-level.
- Balance number: `text-sidebar-foreground font-semibold` (white-ish, clean, no color coding unless low/critical).
- Plus button: Softer hover state.

---

### 7. CSS Token Tuning (index.css)

- Add a subtle `box-shadow` utility class `.card-elevated` for the premium lift pattern: `box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)`.
- Add `.section-label` utility for the consistent uppercase section heading pattern.
- Refine the `--card` token border: make it even softer by nudging `--border` from `40 6% 88%` to `40 6% 90%` -- barely-there borders.

---

### Summary Table

| File | What Changes |
|---|---|
| `src/components/app/AppShell.tsx` | Sidebar: logo separator, active bar accent, refined hover states, header shadow instead of border |
| `src/pages/Dashboard.tsx` | Remove competing titles, luxury typography (font-light for names), whisper-level section labels, more vertical rhythm |
| `src/components/app/OnboardingChecklist.tsx` | Thinner progress bar, editorial step numbers, ghost CTAs, shadow-sm card |
| `src/components/app/GenerationModeCards.tsx` | Remove top border accent, shadow-based depth, invisible icon backgrounds |
| `src/components/app/CreditIndicator.tsx` | Clean dark-theme styling, remove colored borders, white-on-dark simplicity |
| `src/components/app/MetricCard.tsx` | Add shadow-sm for subtle elevation |
| `src/index.css` | Softer border token, .card-elevated utility, .section-label utility |

### Design Principles Applied

- **Luxury = restraint.** Fewer borders, fewer colors, fewer visual elements competing for attention.
- **Depth through shadow, not borders.** Cards float above the warm stone background instead of being outlined.
- **Typography hierarchy.** Large light numbers, small uppercase labels, medium-weight body text -- three clear levels.
- **Sidebar as a quiet anchor.** The left accent bar and refined hover states create navigation clarity without shouting.
- **Product visuals should be the star.** The UI stays muted so that generated images pop when they appear.

