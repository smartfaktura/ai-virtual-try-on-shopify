## Problem

On the **Review & generate** step (Step 6), the user sees what looks like three "Back" pills stacked at the bottom of the wizard card (visible in the screenshot during the `generating` phase).

Source of truth: only one `<Button>Back</Button>` exists in `WizardLayout.tsx` (line 147). The Review step itself (`Step6PreviewAndPick.tsx`) does not render its own Back button. The visual triplication comes from the sticky footer's own pill-shaped card (`rounded-2xl border bg-card/95 backdrop-blur-sm shadow-lg`) sitting under a content area that already overflows into the safe-area inset on small iOS viewports — the rounded card's border, the backdrop-blur halo and the actual Back button all read as separate "pill" outlines, which is exactly what we're seeing.

On Step 6 the sticky footer is also functionally redundant:

- There is no `Next` action (`isLastStep ? null` already hides the CTA).
- The real CTAs are inside the content card (`Generate · X credits` → `Save to library · free` / `Regenerate`).
- The progress dots above can already navigate back.

## Fix

Hide the sticky footer entirely on the last step and surface a single, plain inline `Back` button at the top-left of the Step 6 content (above the Scene name card), so the user still has a clear way back without the stacked-pill visual.

### Changes

**`src/features/brand-scenes/wizard/WizardLayout.tsx`**
- Wrap the sticky footer (`<div className="sticky bottom-2 …">…</div>`) so it only renders when `!isLastStep`.
- Drop the matching `pb-28 sm:pb-10` bottom padding on the content block when `isLastStep` (use `pb-10` only) so the page no longer reserves space for the missing footer.

**`src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`**
- Add a new prop `onBack: () => void`.
- Render a small inline back control at the very top of the returned tree:
  ```tsx
  <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground">
    <ChevronLeft className="w-3.5 h-3.5" /> Back to photo &amp; edit
  </button>
  ```
- Import `ChevronLeft` from `lucide-react`.

**`src/features/brand-scenes/wizard/BrandSceneWizard.tsx`**
- Pass `onBack={handleBack}` to `<Step6PreviewAndPick … />` (line 381).

### Out of scope

- No changes to other wizard steps — the sticky footer continues to work normally on Steps 0–5.
- No changes to `Step5Review`, prompt assembly, edge function, or scene generation logic.
- No schema / API changes.

### Verification

- Open `/app/brand-scenes/new`, advance through to Step 7/7 "Review & generate" on a 414-px viewport.
- Confirm only the inline "Back to photo & edit" link is visible; no sticky pill-bar at the bottom of the wizard card.
- Click it and confirm it returns to Step 5 (or to Cast in the reference flow, matching the existing `handleBack` rules).
- Confirm Steps 0–5 still show the original sticky footer with the single Back + Next buttons.
