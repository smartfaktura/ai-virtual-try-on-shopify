
## Remove "Save Details" button from ProductSpecsCard

Specs already auto-save when the user generates, so the manual save button is redundant.

### Changes in `src/components/app/product-images/ProductSpecsCard.tsx`

1. **Remove the Save Details button** (~lines 422-435): Replace the button + info text row with just the info text, updated to say "Details are saved automatically when you generate"

2. **Clean up unused code**: Remove `saving`/`setSaving` state, `lastSavedSpecs`/`setLastSavedSpecs` state, `hasUnsavedChanges` memo, and `handleSave` callback. Remove unused imports: `Save`, `Loader2`, `Button` (if not used elsewhere in the file).
