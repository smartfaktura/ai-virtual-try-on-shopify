

# Add Branded Team Avatars to Catalog Generation Screen

## What
Add the rotating VOVV.AI team avatar strip (already used in `QueuePositionIndicator` and `MultiProductProgressBanner`) to the catalog generation progress screen, between the progress bar/elapsed time and the "VOVV.AI" branding text.

## Changes

**File: `src/pages/CatalogGenerate.tsx`**

Insert a rotating team member avatar + status message block after the elapsed/remaining time display (line 438) and before the "VOVV.AI" text (line 439). Reuse the same pattern from `QueuePositionIndicator`:

1. Add `useState` for `teamIndex` with a 4-second rotating interval (same as other workflows)
2. Import `TEAM_MEMBERS` from `@/data/teamData`, `Avatar`/`AvatarImage`/`AvatarFallback` from UI, and `getOptimizedUrl`
3. Render a centered row: avatar (w-7 h-7) + "{Name} is {statusMessage}" in italic muted text
4. Place it right above the "VOVV.AI" watermark text, replacing the static watermark since the avatars themselves are branded

This matches the exact pattern already used in `QueuePositionIndicator` (lines 101-108) and `MultiProductProgressBanner`.

