
The user wants the "Claim My Credits" button in the EarnCreditsModal to be fully rounded (pill shape) instead of the current `rounded-xl`.

Current: `rounded-xl` → Change to `rounded-full` to match the rest of the app's pill button language (Create Visuals, Upgrade, etc.).

## Change
File: `src/components/app/EarnCreditsModal.tsx` (line ~92)
- `rounded-xl` → `rounded-full` on the "Claim My Credits" anchor button.

## Out of scope
Everything else in the modal (icons, copy, layout, step rows, caption pill).
