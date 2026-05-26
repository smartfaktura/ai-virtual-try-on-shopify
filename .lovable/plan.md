
## Goal
On `/app/models/new` the Generate button greys out with no visible reason on mobile, and the Model Name field gives no signal it's required. Make required-ness obvious and surface the validation message on mobile.

## Scope
UI/UX only — single file: `src/pages/BrandModels.tsx`. No validation rules, no backend, no business logic changed.

## Changes

### 1. Mark Model Name as required
Both spots that render the Name field (`essentialsBlock` ~L615 and reference-mode `Section` ~L988):
- Add a red `*` after the label text
- Add `aria-required="true"` and `aria-invalid={nameTouched && trimmedName.length < 2}` on the `Input`
- When invalid + touched: `border-destructive focus-visible:ring-destructive` on the input and a small helper line below: *"Required — give your model a name"* in `text-destructive`

Track `nameTouched` state. Set true on input `onBlur`, and also when the user taps the disabled Generate button (see #3).

### 2. Surface validation message on mobile in the sticky footer (~L1103)
Today the validation text uses `hidden sm:block`, so mobile users see nothing. Restructure the pill:

- Mobile: validation row stacks **above** the buttons inside the pill, with an `AlertCircle` icon + `text-destructive` text
- Desktop (`sm+`): keeps current inline layout (message left, buttons right)
- Row only renders when `currentStep === 2 && validationError`

### 3. Tap-to-reveal on disabled Generate
- Add `title={validationError ?? undefined}` on the Generate button (desktop hover hint)
- Wrap the Generate button in a span with `onClick` that — when disabled — runs `setNameTouched(true)` and scrolls the name input into view. This way tapping the grey button on mobile actually tells the user what's missing instead of doing nothing.

## Out of scope
- `canGenerate` logic, `validationError` derivation, credit checks, upload flow — all unchanged
- Brand-scenes wizard footer — separate request if needed
- No copy changes beyond the new helper line and the `*` marker
