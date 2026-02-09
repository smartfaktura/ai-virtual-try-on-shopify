

## Rename "Select Your Clothing" to Better Label

### Problem
The step 1 heading says "Select Your Clothing" which is confusing -- this step is about choosing a product for the virtual try-on, not just "clothing." The stepper already calls it "Product."

### Change

**File: `src/pages/Generate.tsx` (line 642)**

Rename the heading from `"Select Your Clothing"` to `"Add Your Product"` -- this matches the stepper label ("Product") and is clearer about the action (adding a product to try on).

The subtitle on line 644 already says "Choose a clothing item from your products or upload a new photo to try on" which is fine and can stay.

