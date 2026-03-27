# Fix: Image Editing Mode Returns Wrong Results + Auto-Select Original Ratio

## Root Causes

### 1. Prompt pollution in edit mode (main bug)

In `generate-freestyle/index.ts` line 1222, **every** generation — including edits — gets this appended:

```
Output aspect ratio: 1:1. CRITICAL: The image must fill the ENTIRE canvas edge-to-edge...
```

This aggressive instruction overrides the user's edit intent ("remove the bowl"). The AI reads "fill the ENTIRE canvas" and generates a brand-new image instead of surgically editing the original.

### 2. Ambiguous image label

In `buildContentArray` (line 778), the uploaded image is labeled `[REFERENCE IMAGE]` in edit mode. The AI treats it as "inspiration" rather than the actual image to modify. It should be `[IMAGE TO EDIT]`.

### 3. No "Original" aspect ratio option

When editing, the user shouldn't change the ratio — the output should match the input image. Currently there's no way to express this.

## Changes

### File 1: `supabase/functions/generate-freestyle/index.ts`

**A. Skip aspect ratio directive in edit mode (~line 1222)**

```typescript
// Before:
const aspectPrompt = `${finalPrompt}\n\nOutput aspect ratio: ${body.aspectRatio}...`;

// After:
const aspectPrompt = isEditMode
  ? `${finalPrompt}\n\nIMPORTANT: Return the edited image at the SAME dimensions and aspect ratio as the input image. Do not crop, resize, or reframe.`
  : `${finalPrompt}\n\nOutput aspect ratio: ${body.aspectRatio}...`;
```

**B. Label source image as `[IMAGE TO EDIT]` in edit mode (~line 774-778)**

```typescript
const label = imageRole === 'edit' ? '[IMAGE TO EDIT]'
  : imageRole === 'product' ? '[PRODUCT IMAGE]'
  : imageRole === 'model' ? '[MODEL REFERENCE]'
  : imageRole === 'scene' ? '[SCENE REFERENCE]'
  : '[REFERENCE IMAGE]';
```

**C. Strengthen edit prompt in `polishUserPrompt` (~line 148-164)**
Add explicit instruction: "Return the SAME image with ONLY the requested modification. Do NOT regenerate, reimagine, or recompose the image."

### File 2: `src/components/app/freestyle/FreestyleSettingsChips.tsx`

**Add "Original" aspect ratio option** — only visible when an image is uploaded in edit mode - and make it auto selected.

```typescript
export type FreestyleAspectRatio = '1:1' | '3:4' | '4:5' | '9:16' | '16:9' | 'original';
```

Add to `ASPECT_RATIOS` array with a dedicated icon (e.g. `ImageIcon`).

### File 3: `src/pages/Freestyle.tsx`

**Auto-select "original" ratio when entering edit mode:**

- When `imageRole` changes to `'edit'` and a source image exists, set `aspectRatio` to `'original'`.
- When `imageRole` changes away from `'edit'`, revert to `'1:1'` (or previous value).

## Summary

Three files changed. The core fix is backend: stop appending "fill the canvas" instructions in edit mode and relabel the image. The frontend improvement auto-locks ratio to "Original" for a smoother editing UX.