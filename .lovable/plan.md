

# Redesign Video Detail Modal — Unified Settings Panel

## Goal
Remove the prompt section, merge duration/aspect ratio/resolution into the settings grid, and improve the visual design of the settings area for a cleaner, more polished modal.

## Changes

### `src/components/app/video/VideoDetailModal.tsx`

1. **Remove prompt section entirely** (lines 160-182) — no more "PROMPT" block or show more/less toggle
2. **Remove the separate metadata chips** (lines 184-192) for duration and aspect ratio
3. **Merge everything into one unified "Details" section** with improved design:
   - Use rounded card-style rows with icon + label + value instead of plain text grid
   - Include: Duration, Format (aspect ratio), Resolution (derive from aspect ratio: 1:1→1080x1080, 16:9→1920x1080, 9:16→1080x1920), Camera Motion, Style, Scene Type, Motion Goal, Subject Motion, Realism, Loop Style, Audio, Model
   - Each row: subtle bg card with left-aligned label in muted color, right-aligned value
   - Only show rows that have values
4. **Keep title/date/status badges** at top, actions at bottom
5. **Remove `promptExpanded` state** since prompt is gone
6. **Visual polish**: slightly more spacing, cleaner typography hierarchy

### Single file update
- `src/components/app/video/VideoDetailModal.tsx`

