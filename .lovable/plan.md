# Improve /app/material-swap — Materials step (mobile)

Scope: visual/layout polish only on mobile for Step 2 of `src/pages/MaterialSwap.tsx`. No logic, no backend changes. Desktop (`sm:` and up) stays exactly as it is today.

## Problems visible on the current mobile screen
1. Added-material rows stack image+name on top and Save/Remove on a second line — each row eats ~120px of height, so even one swatch pushes Aspect ratios and the summary far below the fold.
2. Upload dropzone is tall (p-6 + big icon) and duplicates the same copy that's already in the section header.
3. Header block (title + subtitle + counter badge) is bulky; subtitle wraps to 2 lines on a 390px screen.
4. The "Tip: tap Save…" helper only renders when there are 0 saved swatches and sits inside the grid, looking like a stray row.
5. Saved-swatch carousel cards are 160px wide with image + label + Add + ⋯ menu — fine on desktop, but on mobile each card is taller than the dropzone.

## Changes

### 1. Compact material row (mobile)
- Switch the row from `flex-col sm:flex-row` to a single horizontal row on mobile too:
  - 48px thumbnail (was 56px) on the left
  - name `Input` fills remaining width
  - Save → icon-only `Button` (hide the "Save"/"Saved" text on mobile, keep aria-label + title)
  - Remove → icon-only `Button` (hide the "Remove" text on mobile)
- Result: ~56px row height vs ~120px today, still tap-friendly (h-9 buttons).

### 2. Slimmer upload dropzone on mobile
- Reduce padding to `p-4` on mobile (keep `sm:p-6`).
- Icon `w-6 h-6` on mobile (keep `sm:w-7 sm:h-7`).
- Drop the secondary line "Drop, paste, or click to add multiple at once" on mobile (`hidden sm:block`) — primary label is enough.

### 3. Tighter header
- Subtitle: shorten on mobile to "One swatch per variant — shape & lighting stay locked" and keep the longer copy on `sm:`.
- Counter badge stays.

### 4. Move the Save tip
- Move the tip out of the materials grid into a single muted helper line directly under the dropzone, only when `savedMaterials.length === 0 && materials.length === 0`. Prevents it from appearing as a phantom grid cell.

### 5. Denser saved-swatch carousel (mobile only)
- Reduce card width from `w-[160px]` to `w-[124px]` on mobile (keep `sm:w-auto`).
- Thumbnail stays aspect-square; label truncates; Add button text shrinks to icon + "Add" only (already is). The ⋯ menu stays.
- Carousel gap `gap-2` stays.

### 6. Vertical rhythm
- Reduce the step's outer `space-y-5` to `space-y-4` on mobile (`space-y-4 sm:space-y-5`).

## Out of scope
- No changes to Step 1 (Product), Step 3 (Review), generation flow, hooks, or any prompt/AI logic.
- No new components, no design tokens added.
- Desktop layout is unchanged (all edits are mobile-first with `sm:` resets).

## Files touched
- `src/pages/MaterialSwap.tsx` — only the Step 2 JSX block (~lines 942–1135).

## Verification
- Open `/app/material-swap` at 390×808 (mobile viewport in preview), advance to Materials step with one swatch added, confirm the dropzone, swatch row, Aspect ratios, and Continue bar all fit with minimal scrolling.
- Resize to ≥640px and confirm desktop layout matches the current production look.
