## Make Brand Models / Brand Scenes gating visible in the upgrade modal

In `src/components/app/UpgradePlanModal.tsx`, each plan card currently only shows credits and images/mo. Add a tiny gating line so users can tell at a glance that Brand Models + Brand Scenes are **not** on Starter and **are** on Growth + Pro.

### Change

Under the existing `{credits.toLocaleString()} credits · ~{approxImages} images/mo` line (around line 353–355), append a single small row that switches on `planId`:

- **Starter** (`planId === 'starter'`):
  `text-[10px] text-muted-foreground/70 mt-1` line:
  `Brand Models & Brand Scenes not included`
- **Growth / Pro**:
  Two compact pill chips: `Brand Models` and `Brand Scenes`, styled `text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold`, wrapped in a `flex flex-wrap gap-1 mt-1.5` row.

Pure visual hint; no logic, copy, or pricing changes elsewhere. Re-uses the `pricingPlans` features data that already lists Brand Models / Brand Scenes for Growth and Pro, so no data edits needed.

### Files

- `src/components/app/UpgradePlanModal.tsx` — ~12 lines added inside the plan-list `.map(...)` block. No other files touched.
