

# Force Nano Banana Pro for Image Editing

## Problem
When editing an image (e.g., "remove the chair"), the system correctly routes to Nano Banana but uses the **Flash** model (`gemini-3.1-flash-image-preview`) instead of **Pro** (`gemini-3-pro-image-preview`). Flash is weaker at surgical edits, leading to lower quality results.

## Fix

**File: `supabase/functions/generate-freestyle/index.ts`** (~line 1220-1225)

Add `isEditMode` as a condition that forces the Pro model:

```typescript
const isEditMode = body.imageRole === 'edit' && !!body.sourceImage;
const aiModel = (forceProModel || isPerspective || hasModelImage || body.quality === "high" || isEditMode)
  ? "google/gemini-3-pro-image-preview"
  : "google/gemini-3.1-flash-image-preview";
```

This ensures every image edit uses Nano Banana Pro for better surgical precision — no UI changes needed.

## Scope
- 1 file: `supabase/functions/generate-freestyle/index.ts` (+ redeploy)
- No database or frontend changes

