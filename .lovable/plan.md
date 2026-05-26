## Summary
Swap the order of the two cards on the Cast → Look step so **Design the look** appears first (left), **Auto-cast** second (right).

## Change
`src/features/brand-scenes/wizard/steps/Step4Cast.tsx` (lines 310–323) — reorder the two `<BranchCard>` elements inside the grid. No logic, styling, or copy changes.