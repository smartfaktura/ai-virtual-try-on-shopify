Update the feedback question in the single-image preview modal on `/app/generate/product-images` results page to use singular wording.

## Change

In `src/components/app/product-images/ResultDetailModal.tsx`, update the `ContextualFeedbackCard` prop:

- `questionText`: `"Are these visuals ready to use?"` → `"Is this visual ready to use?"`

Button labels (Yes, ready / Almost / No) stay the same. No other files affected.