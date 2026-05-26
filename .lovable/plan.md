
# Product Swap — 3-Step Wizard Redesign (v2)

Convert the current long-scroll page into a true stepper: one step visible at a time, persistent progress header, persistent footer with Back / Continue / Generate.

## Step structure

```text
┌─────────────────────────────────────────────────────────┐
│  ← Back to Visual Studio                                │
│                                                         │
│   ●━━━━━━━━━━○━━━━━━━━━━○                              │
│   1 Scene    2 Products  3 Review                      │
└─────────────────────────────────────────────────────────┘
```

- One active step at a time, no long scroll.
- Stepper chips clickable only for completed steps (no jumping ahead).
- Smooth fade/slide between steps.

### Step 1 — Scene
- Source toggle (Library / Upload) on top, picker below.
- Once a scene is picked, a clear preview card with "Change scene" sits at the top of the step.
- **Aspect ratios live HERE**, directly under the scene preview — because ratio is a property of the scene, not the review. Default selection = ratio closest to the source image's natural dimensions.
- Continue disabled until scene + at least one ratio are set.

### Step 2 — Products
- Sticky search + "X / 10 selected" chip at the top.
- "Select all visible (up to 10)" quick action.
- Horizontal **selected tray** pinned at the bottom of the step showing chosen product thumbs with a ✕ to deselect — no need to scroll back up.
- Drop the redundant info box; replace with a single subtle helper line.
- Continue disabled until ≥1 product selected.

### Step 3 — Review & Generate
Pure summary + cost. **No editable controls here** — every change goes back to its owning step via "Edit".

```text
┌──────────────────────────┬──────────────────────────────┐
│  Scene                   │  Cost summary                │
│  [thumb] title           │  ──────────────────────────  │
│  4:5 · 1:1     [Edit]    │  Products       3            │
│                          │  Ratios         2            │
│  Products (3)            │  Images         6            │
│  [t][t][t]     [Edit]    │  Cost / image   6 credits    │
│                          │  ──────────────────────────  │
│                          │  Total          36 credits   │
│                          │  Balance        128 credits  │
│                          │  After          92 credits   │
│                          │                              │
│                          │  [ Generate 6 images ]       │
│                          │  ~50s · refunded on failure  │
└──────────────────────────┴──────────────────────────────┘
```

- No "High Quality" label — Product Swap is single-tier, calling it out is noise.
- No ratio picker on this screen (it's on Step 1 with the scene).
- If `totalCost > credits`: button swaps to "Get more credits" with inline "You need 12 more credits" message.
- Free users with zero credits still get the existing `NoCreditsModal`.
- Sub-line under CTA: estimated time + "Credits are refunded if a generation fails."

## Persistent footer (all steps)

```text
[ ← Back ]      Step 2 of 3 · 3 products selected      [ Continue → ]
```

- On Step 3, "Continue" becomes the primary "Generate N images · X credits" CTA.
- Mobile: footer collapses into a single full-width sticky bar.

## State & navigation

- New `currentStep: 1 | 2 | 3` with `canAdvanceFrom(step)` guards.
- Wizard state persists to `sessionStorage` (`product-swap-wizard`) so HMR reloads (the "random refresh" we discussed) don't wipe selections. Cleared on successful generate.
- Browser Back inside the wizard goes to the previous step; on Step 1 it exits to Visual Studio.
- Deep-link via `?scene=` still lands on Step 1 with the scene preselected. No `?step=` param (avoids back-button confusion).

## Generating + Results view

- Same polling, same team-member rotation, same lightbox.
- Replace the tiny 16×16 scene chip with a 64×64 thumb + product-count badge so users instantly recognize the scene they swapped into.
- "Swap more" button on the Done state returns to a fresh Step 2 with the **same scene + ratios** preserved, so iterating with new products takes 2 clicks.

## Out of scope

- No change to generation pipeline, edge function, model, or pricing.
- No change to library/products data fetching.
- No new design tokens — reuse existing card/border/primary/muted.

## Technical sketch

- Refactor `src/pages/ProductSwap.tsx`:
  - Extract co-located `<Step1Scene />`, `<Step2Products />`, `<Step3Review />` components in the same file.
  - Shared `<WizardHeader />` and `<WizardFooter />` shells.
  - Tiny `useSessionStorageState('product-swap-wizard', …)` helper (~15 lines).
- `useProductSwap` hook untouched.
- Results view branch untouched except the small visual tweaks above.

## Effort

~1.5–2 hours: ~70% UI restructure, ~15% sessionStorage + step guards, ~15% QA across desktop + mobile.
