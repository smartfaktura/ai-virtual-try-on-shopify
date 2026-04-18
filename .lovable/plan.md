
The user wants the mobile scene admin row card restructured: instead of a full-width 4:5 image on top with info below, make it a horizontal split — 4:5 image on the LEFT, scene info (title, badges, triggers, action buttons) on the RIGHT.

Looking at the screenshot (`AdminProductImageScenes.tsx` `SceneRow`), the current mobile layout stacks image-on-top, info-below. Cards take huge vertical space (one card ≈ full screen height). A side-by-side split will let users scan ~3–4 scenes per screen instead of 1.

**Plan**

Edit `src/pages/AdminProductImageScenes.tsx` → `SceneRow` component only (mobile breakpoint, keep desktop unchanged):

1. Wrap the row content in a `flex gap-3` container on mobile (`sm:block` to revert on desktop if desktop was different — verify during edit).
2. **Left column** (fixed width ~120px): The `ScenePreviewThumb` constrained to `aspect-[4/5] w-[120px] shrink-0 rounded-lg overflow-hidden`.
3. **Right column** (`flex-1 min-w-0`): 
   - Title row (scene name + small badges) — allow wrapping, `text-sm` 
   - Slug line — `text-xs text-muted-foreground truncate`
   - Triggers + Cat order line — `text-xs` 
   - Action icons row (up/down/edit/copy/hide/delete) — wrap if needed, slightly smaller tap targets but keep ≥36px
4. Keep desktop layout untouched (use `sm:` prefix to switch back to current stacked or grid layout if it differs).

**Result:** On mobile, ~3 scene cards visible per viewport. Image stays prominent at 4:5 on the left, all metadata + actions on the right, much faster scanning of the admin scenes list.

**Files to edit:**
- `src/pages/AdminProductImageScenes.tsx` (`SceneRow` only)
