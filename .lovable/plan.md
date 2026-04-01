

# Expand Per-Image Customization to All Settings

## Problem
The "Customize per image" panel currently only exposes 3 override fields (Camera Motion, Motion Intensity, Custom prompt). Users expect to control **all** video settings per image.

## Changes

### `src/pages/video/AnimateVideo.tsx` (lines 822-876)
Replace the current minimal 3-field override panel with the full set of overridable settings, organized in sections:

**Product Context section:**
- Category (select — reuse existing category options)
- Scene Type (select)

**Motion section:**
- Motion Goal (select from `getMotionGoalsForCategory`)
- Camera Motion (select from `CAMERA_MOTIONS`)
- Subject Motion (select)
- Motion Intensity (select: low/medium/high)
- Realism Level (select)
- Loop Style (select)

**Preservation section:**
- Preserve Scene (switch)
- Preserve Product Details (switch)
- Preserve Identity (switch)
- Preserve Outfit (switch)

**Output section:**
- Aspect Ratio (select: 9:16, 1:1, 16:9)
- Duration (select: 5s, 10s)
- Audio Mode (select: silent, ambient)

**Prompt section:**
- Custom motion note (textarea — already exists)

Each field falls back to the shared setting when not overridden. The existing `setOverride(key, value)` pattern and `perImageSettings` Map already support arbitrary keys — no hook changes needed.

### Layout
- Use collapsible sections or a compact grid layout (3-4 columns for toggles, 2 columns for selects) to keep it scannable
- Add section headers matching the main settings panel naming
- Keep the "Reset to shared" button at the top

### No changes needed in hooks
`useBulkVideoProject.ts` already merges `perImageParams` with shared params via spread — all new keys will flow through automatically.

### Files
- **Update**: `src/pages/video/AnimateVideo.tsx` — expand per-image override panel (lines 822-876)

