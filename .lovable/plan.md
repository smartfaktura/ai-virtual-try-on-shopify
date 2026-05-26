
## Goal
On `/app/brand-scenes/new` final Review step the Scene name is required but the affordance is too quiet — Generate greys out with no clear reason, especially on mobile.

## Scope
UI/UX only — `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`. No gating logic changed (`nameValid = trimmedName.length >= 2` stays). Reference flow collects name in Step3 and is out of scope.

## Changes

### 1. Scene name field — required affordance (~L273-290, wizard flow only)
- Append red `*` after the "Scene name" label
- Add `nameTouched` state, set true on input `onBlur` and on attempted Generate click
- When `nameTouched && !nameValid`:
  - Input gets `border-destructive focus-visible:ring-destructive`
  - Replace the grey "Required — this is how the scene appears in your library" caption with destructive variant: `<AlertCircle/> Required — give your scene a name`
- `aria-required="true"` + `aria-invalid` on the Input
- Attach `ref={nameInputRef}` for scroll/focus

### 2. Generate button — tap-to-reveal + visible reason (~L367-391)
- Wrap the disabled `<Button>` in a `<span>` whose `onClick` runs `revealValidation()` when `!nameValid` → `setNameTouched(true)`, scroll name input into view, focus it. Inner Button keeps `disabled` so generation never fires.
- Move the "Name this scene to enable generation" hint **above** the button, render it with `text-destructive` + `AlertCircle` icon so it's the first thing visible near the CTA on mobile.
- Add `title={!nameValid ? "Name this scene first" : undefined}` for desktop hover hint.

### 3. Empty-variations Regenerate (~L398-413)
- Same tap-to-reveal wrapper on the disabled Regenerate button.

## Out of scope
- `nameValid`, credit, rights-checkbox gates — unchanged
- Reference flow (Step3 handles name; sticky footer already surfaces "Name this scene")
- `/app/models/new` — already shipped previous turn
