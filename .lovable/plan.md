

## Skip AI Analysis for Room Uploads

### Problem
When uploading a room photo in the Interior / Exterior Staging workflow, the AI product analyzer runs automatically, showing "AI analyzing room..." spinner. This is unnecessary -- the user will fill in room details themselves.

### Solution
Skip the `analyzeProduct()` call when `variant === 'room'`. One-line change in `handleFile`.

### File: `src/components/app/UploadSourceCard.tsx`

In the `handleFile` function (line 80), change the unconditional `analyzeProduct(file, productInfo)` call to only run when the variant is not `'room'`:

```typescript
// Before:
analyzeProduct(file, productInfo);

// After:
if (!isRoom) {
  analyzeProduct(file, productInfo);
}
```

This ensures room uploads immediately show the editable form fields without any loading spinner or unnecessary API call.
