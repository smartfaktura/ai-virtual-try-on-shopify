

## Fix mobile post-import UX in URL flow + remove emojis

### Problems (from screenshot 2)
1. After URL import on mobile, the row of small thumbnails with "Tap an image to set its role" is unclear — users don't understand the popover system or how to change the Main image.
2. Two stray emojis (`📐`) violate the no-emoji minimalist rule: dimensions badge + "Extra angles improve AI accuracy" hint.
3. 64px thumbnails are below comfortable tap targets on mobile.
4. Hint text is too small/quiet ("text-[11px] text-muted-foreground") — looks like a caption, not an instruction.
5. The `MAIN` badge over the chosen image is the only role indicator, but it's not obvious this can be reassigned by tapping a *different* thumbnail and choosing "Main".

### Fixes — `src/components/app/StoreImportTab.tsx`

**Remove emojis (both viewports):**
- Line 372: drop `📐 ` prefix from dimensions badge.
- Line 543: replace `📐 Extra angles improve AI accuracy` with plain "Extra angles improve AI accuracy" (no leading icon, or use existing `Camera` lucide icon like ManualProductTab does for consistency).

**Mobile clarity for the image role row** (use `useIsMobile`):
- Replace small "Tap an image to set its role" caption with a clearer two-line block on mobile:
  - Line 1 (medium weight, `text-xs text-foreground`): "Choose your main photo"
  - Line 2 (`text-[11px] text-muted-foreground`): "Tap a thumbnail to change roles (Main, Back, Side…)"
- Bump thumbnail size on mobile from `w-16 h-16` (64px) → `w-20 h-20` (80px) for easier tapping.
- Make the role badge always visible on the currently-selected Main image (already is) but also add a faint "Tap to change" hint *only* when no other roles are assigned yet (first-time educational nudge — disappears after any popover interaction). Keep state local; no backend.
- On mobile, when popover opens, ensure `align="start"` and `sideOffset={8}` so it doesn't get clipped near the screen edge.

**Extra angles row on mobile:**
- Replace the leading `📐` with the `Camera` lucide icon (already imported in ManualProductTab pattern) at `w-3.5 h-3.5 text-muted-foreground/60`, matching ManualProductTab's collapsible header style for consistency.
- On mobile, allow the slots row to wrap (`flex-wrap`) instead of fixed flex so 5 slots don't overflow horizontally.

### Out of scope
- Desktop layout (only thumbnail size + emoji removal applies).
- Popover internals, save logic, role colors, backend.
- Other tabs (CSV, Shopify, Manual).

### Acceptance
- No emojis anywhere in the URL import result view.
- On mobile: clear instruction "Choose your main photo / Tap a thumbnail to change roles" sits above an 80px thumbnail row; popover opens cleanly without edge clipping; "Extra angles" row uses Camera icon and wraps if needed.
- Desktop layout visually unchanged except emoji removal and Camera-icon swap.

