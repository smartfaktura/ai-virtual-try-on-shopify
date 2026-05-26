## Add "Swap Product" action + per-image feedback to image preview modals

### 1. New "Swap Product" button — both modals
Adds a button that reuses the opened image as the **scene** in the Product Swap flow.

- **`src/components/app/LibraryDetailModal.tsx`** — insert between "Generate More Angles" and "Generate Video":
  ```tsx
  <Button variant="outline" onClick={() => { navigate(`/app/product-swap?scene=${encodeURIComponent(activeItem.imageUrl)}`); onClose(); }}>
    <ArrowLeftRight className="w-4 h-4 mr-2" /> Swap Product
  </Button>
  ```
- **`src/components/app/product-images/ResultDetailModal.tsx`** — same button in same position.

ProductSwap already supports `?scene=<url>` (verified in `src/pages/ProductSwap.tsx` L63–66) — it auto-selects the scene and only requires the user to pick products to swap in.

### 2. Feedback card inside Product Images result modal
Add the existing `ContextualFeedbackCard` to `ResultDetailModal.tsx`, scoped per image:

```tsx
<ContextualFeedbackCard
  workflow="product-visuals"
  questionText="Are these visuals ready to use?"
  buttonLabels={{ yes: 'Yes, ready', almost: 'Almost', no: 'No' }}
  reasonChips={['Need better background', 'Wrong angle / shot', 'Product details off', 'Lighting / shadows', 'Not consistent enough', 'Missing shot type', 'Needs higher realism', 'Other']}
  textPlaceholder="What is missing? e.g. cleaner background, sharper details"
  resultId={active.jobId}
  imageUrl={active.url}
  triggerType="result_ready"
/>
```
Placed below the action buttons inside the right info panel.

### Verification
- Library detail modal shows a new "Swap Product" button → opens `/app/product-swap` with the image preloaded as the scene.
- Product Images result modal shows the same button + a "Help us improve" feedback card under the actions.
- No other modal behavior changes.