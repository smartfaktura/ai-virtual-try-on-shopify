

# Improve Loading State After Image Upload

## Current State
Lines 429-438: A simple card with `Brain` icon saying "Analyzing your image... Detecting product category and scene type". Below it, nothing — large empty space. A disconnected green success toast appears on upload.

## Changes to `src/pages/video/AnimateVideo.tsx`

### 1. Add Simulated Analysis Steps
Add a `useEffect` that cycles through analysis stages during `isAnalyzingImage`:
- Step 0 (immediate): "Image uploaded" — checkmark
- Step 1 (1s): "Detecting category" — active
- Step 2 (2s): "Detecting scene type" — active  
- Step 3 (3s): "Preparing motion recommendations" — active

Track with `analysisStep` state (0-3), auto-increment via interval while `isAnalyzingImage` is true.

### 2. Replace the Analysis Card (lines 429-438)
Replace the simple loader with a rich analysis panel containing:

**Left side: Image preview + inline success badge**
Show the uploaded image with a small "Image uploaded" badge overlaid (replaces toast). Remove reliance on the green toast for upload confirmation.

**Right side: Step-based progress + live preview fields**
- 4-step vertical progress with checkmarks for completed steps and a spinner for the active step
- Below steps, a "Detection Preview" card showing:
  - Category: `detecting…` → resolved label
  - Scene type: `detecting…` → resolved label  
  - Motion goals: `preparing…` → resolved label
  - Best aspect ratio: `pending…`

### 3. Dynamic Assistant Card During Loading
Change the VOVV.AI Studio tip banner text while analyzing to: "We're detecting category, scene type, and the most realistic motion options for this image."

### 4. Skeleton Cards for Upcoming Sections
Below the analysis panel, show shimmer skeleton placeholders for:
- Product Context (skeleton chips)
- Recommended Motion (skeleton cards)
- Motion Refinement (skeleton sliders)
- Settings (skeleton buttons)

Use the existing `Skeleton` component from `@/components/ui/skeleton`.

### 5. Remove Upload Success Toast
The `handleFileSelect` callback currently triggers a toast via `useFileUpload`. Check if the toast comes from there or from sonner directly. Integrate success state into the page flow instead — the step progress "Image uploaded ✓" replaces it.

## Files to Modify
- `src/pages/video/AnimateVideo.tsx` — All changes: analysis step state, rich loading panel, skeleton sections, dynamic assistant text
- `src/hooks/useFileUpload.ts` — Check and remove any success toast on upload

