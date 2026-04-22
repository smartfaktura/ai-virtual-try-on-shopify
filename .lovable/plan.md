
## Swap order: Action buttons above, Help us improve below

In `src/components/app/product-images/ProductImagesStep6Results.tsx`, swap the two blocks so the action buttons (Generate More / Start New / Download All / View in Library) sit directly under the results grid, and the **Help us improve** feedback card moves below the actions.

### File touched
- `src/components/app/product-images/ProductImagesStep6Results.tsx` — move the `<ContextualFeedbackCard …>` block (currently lines 163–172) to render **after** the Actions `<Card>` block (currently lines 175–199). No prop or styling changes.

### Validation
- `/app/generate/product-images` after a generation completes → grid → **Generate More / Start New / Download All / View in Library** card → **Help us improve** card.

### Out of scope
No copy, styling, or other workflow result screens changed.
