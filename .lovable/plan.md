## 1. Brand Scenes results page — `/app/brand-scenes/new` (Step 6 picking phase)

In `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`:

- **Remove the oversized scene name header.** Drop the `text-base font-semibold tracking-tight` `{sceneName}` line (around line 422–424) from the picking-phase card. Keep only the tiny "Pick your favorite" eyebrow + helper copy.
- **Two-column layout on the results screen.** Restructure the picking-phase area into a single grid:
  - Left column (col-span-2 on `lg`): the existing `BrandSceneVariationGrid` with its action row (Regenerate + Save).
  - Right column (col-span-1 on `lg`): a compact "Scene summary" card containing the `ReferenceThumb` (if any) at the top, then `<Step5Review answers={answers} onNegativeNoteChange={...} />` inlined. The Step5Review currently rendered separately at line 481 is removed from the bottom and only rendered in the right column during the `picking` / `saving` phases.
- For the `idle` and `generating` phases, keep the existing single-column layout (no summary sidebar) so it does not crowd the generate CTA.
- On mobile (`<lg`) the grid collapses to one column (variations first, summary below) — handled by Tailwind `grid-cols-1 lg:grid-cols-3`.
- No prompt/payload/admin debug changes; they stay at the bottom.

## 2. Brand Models — `/app/models/new` single confirmation

In `src/pages/BrandModels.tsx`:

- **Delete the "Final check" second checkbox section** (lines 1117–1141) — the entire `{isReferenceMode && uploadedUrl && termsAccepted && (<Section title="Final check">…</Section>)}` block.
- **Remove `finalRightsAck` state and all references**:
  - Drop the `useState` declaration and the reset call in `runGenerate` (line 364).
  - Remove the `!finalRightsAck` branch from `validationError` (line 308) and the `&& finalRightsAck` clause from `isLowCreditsError` (line 311).
- Keep the single inline rights checkbox under the uploaded image (the existing `termsAccepted` block at lines 836–855) as the only confirmation. `logResponsibilityAcceptance()` still fires inside `handleGenerate` when reference mode is active, so the audit log is preserved.

## Notes

- No backend, schema, or API changes.
- Brand Scenes still keeps its first reference checkboxes in Step 3; only the redundant "second check" panel inside Step 6's idle phase remains there (it's a separate page from upload, so the double-confirm there is intentional — leave it).
