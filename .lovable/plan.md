

## Hide "Enhance to PRO HD" Button

Remove the upscale/enhance functionality from the library detail modal since it's not needed right now.

### Changes

**File: `src/components/app/LibraryDetailModal.tsx`**

- Remove the "Enhance to PRO HD" button, the upscaling loading state, and the separator before it
- Remove all upscale-related state variables (`upscaling`, `upscaledUrl`, `upscaleMessageIndex`) and the `handleUpscale` function
- Remove the `UPSCALE_MESSAGES` array and the `Loader2`/`Sparkles` icon imports
- Remove the upscale message rotation `useEffect`
- Keep the PRO HD badge display for any previously upscaled items (read-only indicator)
- Keep Download and Delete buttons as-is

This is a clean removal -- no other files need changes.

