
Goal: Fix `/app/workflows` mobile 2-column grid so animated overlays fit cleanly inside thumbnails (mobile only), without changing desktop row/3-col behavior.

1) Identify and isolate the mobile 2-col variant
- File: `src/pages/Workflows.tsx`
- Pass an explicit prop to compact cards only when `isMobile && effectiveLayout === '2col'` (e.g. `mobileGridCompact`).
- Keep existing behavior for desktop/tablet layouts.

2) Give mobile grid cards more vertical room
- File: `src/components/app/WorkflowCardCompact.tsx`
- Make thumbnail ratio taller only for mobile compact mode (e.g. `aspect-[2/3]` on mobile, keep current ratio on larger screens).
- Keep this scoped to the 2-col mobile view so row/desktop cards are unchanged.

3) Replace blur-prone global scaling with true compact sizes
- File: `src/components/app/WorkflowAnimatedThumbnail.tsx`
- Remove the current “scale whole element” approach for compact mode.
- Add compact size tokens per element type (product/scene chips, model circle, action button, badges, label font sizes/padding) so overlays are genuinely smaller and sharper.
- This avoids oversized overlays and improves readability on small screens.

4) Apply compact sizing consistently across animation modes
- File: `src/components/app/WorkflowAnimatedThumbnail.tsx`
- Ensure compact sizing is used in recipe and carousel overlays (and compact badge sizing where relevant in upscale/staging) so every workflow type fits in mobile 2-col cards.

5) Keep loading/spacing aligned with new mobile card proportions
- File: `src/pages/Workflows.tsx`
- Update compact-grid skeleton thumbnail ratio to match the new mobile thumbnail ratio.
- Slightly optimize mobile grid gap if needed (mobile-only) to maximize usable card width.

Acceptance checks
- On mobile in 2-col grid, animated chips/circles/badges stay fully inside card bounds and no longer dominate or clip.
- Text remains readable and crisp.
- Desktop row and desktop 2/3-col layouts remain visually unchanged.

Files to update
- `src/pages/Workflows.tsx`
- `src/components/app/WorkflowCardCompact.tsx`
- `src/components/app/WorkflowAnimatedThumbnail.tsx`
