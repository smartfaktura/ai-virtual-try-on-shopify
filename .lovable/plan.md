Remove the `<ProductContextStrip>` block from `src/pages/ProductImages.tsx` (currently rendered between steps 2 and 3) so the "Products N Change" indicator no longer appears on the Shots or Setup steps. Users can still go back via the stepper back button to change their product selection.

Technical detail:
- Delete lines 1398-1400 in `src/pages/ProductImages.tsx`:
  ```tsx
  {step >= 2 && step <= 3 && selectedProducts.length > 0 && (
    <ProductContextStrip products={selectedProducts} onChangeProducts={() => setStep(1)} />
  )}
  ```