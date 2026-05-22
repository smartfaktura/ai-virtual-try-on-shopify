## Two small fixes on `/app/brand-scenes/new`

### 1. Step 0 — "Build from the wizard" appears pre-selected

**Cause:** `useWizardState` initializes `source: "wizard"` with `sourcePicked: false`. `Step0ChooseSource` only checks `value === "wizard"` for the active state, so the first card renders as selected on entry even though the user has not chosen yet.

**Fix:** `src/features/brand-scenes/wizard/steps/Step0ChooseSource.tsx`
- Gate both `WizardCard` `active` props on `picked`:
  - Wizard card: `active={picked && value === "wizard"}`
  - Reference card: `active={picked && value === "reference" && referenceUnlocked}` (already partly gated; add `picked`)
- No state or data-flow changes; `picked` is already passed in.

### 2. Sticky bottom bar has odd shadow at bottom corners

**Cause:** `WizardLayout.tsx` line 165 wraps the floating card in a sticky container with `overflow-hidden`. The inner card has `shadow-lg`, and the wrapper clips the shadow at the bottom (and sides), producing the visible "cut" look.

**Fix:** `src/features/brand-scenes/wizard/WizardLayout.tsx`
- Remove `overflow-hidden` from the outer sticky wrapper (keep it on the inner `rounded-2xl` card only, which already has `overflow-hidden` to clip its own contents).
- Add a small vertical padding so the shadow has room to render without being clipped by the parent scroll area, e.g. wrapper becomes `sticky bottom-4 z-20 max-w-full min-w-0 pb-[env(safe-area-inset-bottom)]`.

### Out of scope
No copy, layout, or business logic changes beyond the two fixes above.
