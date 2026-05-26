Remove the duplicate "Help us improve" feedback section from the results page since it's already in the image preview modal.

## Change

In `src/components/app/product-images/ProductImagesStep6Results.tsx`, remove lines 188-198 (the `ContextualFeedbackCard` block and its comment). Also remove the now-unused `ContextualFeedbackCard` import on line 15.