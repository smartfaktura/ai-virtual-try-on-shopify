## Problem

Two reference-upload flows pop a modal that gates the file picker:

- **Brand Scenes wizard** (`/app/brand-scenes/new` → Step 3 Reference): clicking **Choose image** opens `ResponsibilityModal` with 3 checkboxes. The modal blocks the file picker until all are ticked, which feels broken — users expect Choose image to open the file picker.
- **Brand Models** (`/app/models` → New brand model → "From reference photo"): file picker works, but a `ConfirmDialog` pops at Generate time asking the user to re-confirm rights. Users want that as an inline checkbox too.

User also wants a **second sanity-check checkbox** near the Generate button so the rights confirmation is acknowledged twice.

## Fix

### 1) Brand Scenes wizard — Step 3 Reference (`src/features/brand-scenes/wizard/steps/Step3Reference.tsx`)

- Remove the `ensureAccepted()` gate from `handleFiles`, the **Choose image** button and the clipboard-paste handler. File picker opens immediately.
- After an image is uploaded (`previewUrl` present), render the 3 rights checkboxes inline directly under the uploaded image card (same copy as `ResponsibilityModal`):
  - "I own this image or have permission to use it"
  - "No copyrighted logos or recognizable people"
  - "It's used only as a composition guide"
- Keep `responsibilityAccepted` in wizard state; flip it to `true` only when all 3 inline boxes are ticked (call `onRequestResponsibility` → renamed action `acceptResponsibility` dispatched from parent, or accept a new `onAcceptResponsibility` prop). Wire up:
  - Add `onAcceptResponsibility: () => void` prop, called when all 3 boxes become checked.
  - Keep the existing Supabase `reference_responsibility_acceptances` insert (move it from the modal's `onAccept` into a small helper triggered when all 3 inline boxes are ticked).

### 2) Brand Scenes wizard parent (`src/features/brand-scenes/wizard/BrandSceneWizard.tsx`)

- Delete `ResponsibilityModal` import, `modalOpen` state, `requestResponsibility`, and the `<ResponsibilityModal ... />` JSX.
- Pass `onAcceptResponsibility` to `Step3Reference` that performs the `supabase.from('reference_responsibility_acceptances').insert(...)` + `dispatch({ type: "acceptResponsibility" })`.
- Extend the existing gating so **Next is also disabled** in reference mode when `!state.responsibilityAccepted` (so users cannot leave Step 3 without confirming).
- Delete `src/features/brand-scenes/wizard/components/ResponsibilityModal.tsx` (unused after refactor).

### 3) Brand Scenes Step 6 review — second confirm (`src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`)

- Only when `isReferenceFlow && referenceImageUrl`: render a small inline checkbox row directly above the Generate button:
  - "I confirm again — I have the right to use this reference and take full responsibility for the generated images."
- Local `finalConfirm` state. Disable the Generate button while `!finalConfirm` (in reference flow only). Add an inline disabled reason ("Confirm the rights checkbox").

### 4) Brand Models (`src/pages/BrandModels.tsx`)

- The inline "I confirm I have the right…" checkbox (line 837–857) already exists after upload — keep it. That covers the "inline checkmark right after upload" requirement.
- Replace the `ConfirmDialog` popup at Generate time with a **second inline checkbox row** rendered directly above the Generate button (only when `isReferenceMode && uploadedUrl`):
  - "Second check — I confirm I have rights to this reference and accept responsibility for every generated image."
- Add local `finalRightsAck` state; include it in `validationError` so Generate is disabled until ticked.
- In `handleGenerate`: drop the `setConfirmOpen(true)` branch and the `SKIP_KEY` session-storage logic. Always call `logResponsibilityAcceptance()` directly, then `runGenerate()`.
- Delete the `<ConfirmDialog open={confirmOpen} ... />` block (lines ~1147–1176) and the `confirmOpen` state.
- Remove the now-unused `ConfirmDialog` import if no other use remains in the file.

## Out of scope

- No backend / RLS / schema changes. The existing `reference_responsibility_acceptances` insert is preserved, just triggered from the inline flow.
- No copy changes elsewhere; only the strings explicitly listed above.

## Files touched

- `src/features/brand-scenes/wizard/steps/Step3Reference.tsx` (edit)
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx` (edit)
- `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx` (edit)
- `src/features/brand-scenes/wizard/components/ResponsibilityModal.tsx` (delete)
- `src/pages/BrandModels.tsx` (edit)