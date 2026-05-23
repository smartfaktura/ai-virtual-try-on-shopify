Fix the "Build from a reference" confirmation popup on `/app/brand-scenes/new` so the responsibility modal always appears when the user picks the reference card.

## Root cause

In `BrandSceneWizard.tsx`, `referenceUnlocked` is computed as `sessionAccepted || state.responsibilityAccepted`. `sessionAccepted` reads `sessionStorage["brand-scenes:responsibility-accepted"]`. Once the user accepts the modal once, the key is written and **every subsequent visit to the wizard (within the tab session) silently skips the popup** — the card click goes straight to `onChange("reference")` and the modal never opens. That matches what the user is seeing.

`Step0ChooseSource` also branches: `if (referenceUnlocked) onChange("reference"); else onPickReference()`. So when "unlocked" it bypasses `handlePickReference` entirely.

## Fix

1. **Always route reference clicks through `handlePickReference`** in `Step0ChooseSource.tsx`.
   - Drop the `if (referenceUnlocked) onChange(...) else onPickReference()` branch.
   - Single onClick: `onPickReference()`. Keep `referenceUnlocked` only to swap the lock icon / "Quick check required" tag.

2. **Make `handlePickReference` open the modal on every fresh wizard mount** in `BrandSceneWizard.tsx`.
   - Remove the `sessionAccepted` shortcut (delete the `sessionStorage` read + write of `RESPONSIBILITY_KEY`).
   - Keep `state.responsibilityAccepted` (per-mount React state) as the only gate, so within a single wizard session after Accept the user isn't re-prompted, but a refresh / re-entry shows it again.
   - Keep the Supabase insert into `reference_responsibility_acceptances` for the audit trail.
   - Remove the now-unused `RESPONSIBILITY_KEY` constant.

3. **No DB or schema changes.** No changes to `ResponsibilityModal` itself.

## Files touched

- `src/features/brand-scenes/wizard/steps/Step0ChooseSource.tsx` — simplify reference card onClick.
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx` — drop sessionStorage shortcut, simplify `handlePickReference`, remove the unused constant and the `window.sessionStorage.setItem` call inside the modal's Accept handler.

## Verification

- Fresh load → click Build from a reference → modal opens.
- Accept → source becomes `reference`, wizard advances.
- Click Back to step 0, click Build from a reference again → no modal (already accepted this session).
- Reload page → click reference → modal opens again.
