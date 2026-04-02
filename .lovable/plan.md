

# Remove Spinning Gradient Ring & Clean Up Generation UI

## What changes

Remove the conic-gradient spinning shadow ring from both the **preparing state** (lines 307-314) and the **in-progress state** (lines 511-523). Replace with a clean, minimal approach.

### 1. Preparing state (lines 306-318)
- Remove the `conic-gradient` spinning blur div entirely
- Replace with a simple clean icon: `Loader2` spinner inside a plain circle (no shadow ring)

### 2. In-progress state (lines 511-523)
- Remove the `conic-gradient` spinning blur div
- Replace with a clean `Camera` icon in a simple bordered circle — no spinning shadow effect
- Keep the subtle pulse on the phase badge dot as the only animation indicator

### File
- `src/pages/CatalogGenerate.tsx` — two sections to simplify

