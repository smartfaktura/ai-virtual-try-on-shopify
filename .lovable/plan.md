

# Add "Edit Image" Button in Library → Freestyle

## What It Does
Adds an **Edit** button to the Library image detail modal. Clicking it navigates to Freestyle with the image pre-loaded in **edit mode**, with a contextual placeholder guiding the user.

## Why It's Safe
- The backend (`generate-freestyle` edge

<lov-plan>

# Add "Edit Image" Button in Library → Freestyle

## What It Does
Adds an **Edit** button to the Library image detail modal. Clicking it navigates to Freestyle with the image pre-loaded in **edit mode**, with a contextual placeholder guiding the user.

## Why It's Safe
- The backend (`generate-freestyle` edge function) already fully supports `imageRole: 'edit'` with edit intents (replace product, change background, change model, enhance)
- The `ImageRoleSelector` component already exists in Freestyle for picking edit intents
- The prompt builder already auto-generates edit instructions when no prompt is typed
- We just need to wire the entry point and handle the incoming URL param

## Changes

### 1. `src/components/app/LibraryDetailModal.tsx`
- Add `Pencil` icon import
- Add **"Edit"** button in the action bar (after Download, before other tools)
- On click: navigate to `/app/freestyle?editImage=<encodedUrl>&imageRole=edit`, close modal

### 2. `src/pages/Freestyle.tsx`
- In the existing `useEffect` that reads `searchParams` (line ~241), add handling for `editImage` param:
  - Set `sourceImagePreview` to the URL (for immediate display)
  - Convert to base64 via `convertImageToBase64` for generation submission
  - Set `imageRole` to `'edit'`
  - Expand prompt panel on mobile
  - Clear params from URL

### 3. `src/components/app/freestyle/FreestylePromptPanel.tsx`
- Update textarea placeholder: when `sourceImagePreview` exists AND `imageRole === 'edit'`, show:
  *"Describe what to change — remove a detail, swap background, adjust colors…"*
- This replaces the generic "Optional — describe extra details" message

## Edge Cases Handled
- **URL length**: Supabase storage URLs are long but well within URL limits; `encodeURIComponent` handles special chars
- **Params cleanup**: Clear `editImage` + `imageRole` from URL after reading (same pattern as existing Discover params)
- **Base64 conversion**: `convertImageToBase64` already handles HTTPS URLs by returning them as-is — the edge function accepts both formats
- **No extra credit cost**: Edit mode uses same credit cost as regular generation
- **Image role auto-set**: Forces `imageRole='edit'` so the `ImageRoleSelector` shows correct state and edit intent chips appear

### Files
- `src/components/app/LibraryDetailModal.tsx`
- `src/pages/Freestyle.tsx`
- `src/components/app/freestyle/FreestylePromptPanel.tsx`

