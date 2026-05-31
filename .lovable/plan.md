## Upscaling — finish results page polish

Scope: `/app/generate/image-upscaling` results step, `src/pages/Generate.tsx`. Gated on `isUpscale`.

### 1. Remove "Crafted by your studio team · Saved to your library" footer for upscale
The avatars + footer text + "View in Library" CTA block (after the results card) is targeted at creative generations. For upscaling it's irrelevant. Hide the entire footer block when `isUpscale`. Keep "Start Over" and "Download All" in the toolbar; users can still reach the library via the sidebar.

### 2. Fix the strange white space on non-4:5 ratios
Cause: the upscale grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` with the default `align-items: stretch`. Each tile becomes as tall as the tallest tile in the row, but the image inside uses `w-full object-cover aspect-auto`, so a shorter 3:4 / 1:1 / 16:9 image leaves blank space below it.

Fix:
- Add `items-start` to the upscale grid container so each tile only takes its natural height (no stretching).
- Keep the existing aspect-auto image so we never crop the user's actual upscaled output.

### What stays
- Topaz call path (unchanged).
- Toolbar (Select All, Download All, Start Over).
- Lightbox + per-image download / fullscreen.
- Floating selection bar.

### Out of scope
- No backend / worker changes.
- No edits to other workflows (Crafted footer and grid stretch behavior stay intact for non-upscale).
