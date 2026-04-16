

# Admin Scenes Mobile UX + Product Visuals Scenes Link

## Problems
1. **Scene cards overflow on mobile** — badges (Custom, Prompt Only, workflow names) and action buttons (image, copy, arrows, delete) all sit in one horizontal row, causing overlap and clipping on small screens
2. **"Product Visuals Scenes" missing from admin dropdown** — `/app/admin/product-image-scenes` has no entry in the mobile hamburger menu
3. **Action buttons too dense on mobile** — 6-7 icon buttons (image upload, reset, copy, move-to-top, up, down, delete) crammed into a single row

## Changes

### File: `src/components/app/AppShell.tsx`

**Add "Product Visuals Scenes" to admin dropdown (after line 361)**
Insert a new button navigating to `/app/admin/product-image-scenes` with a Camera/Layers icon, placed right after the existing "Scenes" entry.

### File: `src/pages/AdminScenes.tsx` — SceneRow component (lines 1095-1376)

**1. Stack layout on mobile instead of single row**
Change the scene row from `flex items-center` to a stacked layout on mobile:
- Top row: thumbnail + name/metadata (keep horizontal)
- Badges row: wrap to a second line with `flex-wrap` on mobile
- Action buttons: move below the metadata on mobile, keep inline on desktop

Current structure (line 1096):
```
flex items-center gap-2.5 px-3 py-2
```
New structure:
```
flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 px-3 py-2.5
```

**2. Badges row — allow wrapping (line 1162)**
The badges row already has `flex-wrap` but sits in a cramped single-line context. Add `gap-1` spacing so badges wrap cleanly on narrow screens.

**3. Action buttons — responsive layout (lines 1303-1373)**
Wrap the actions div to stack on mobile:
- Current: `flex items-center gap-0.5 flex-shrink-0` — forces all buttons in one line
- New: `flex items-center gap-0.5 flex-shrink-0 flex-wrap sm:flex-nowrap` with smaller buttons on mobile (`h-6 w-6 sm:h-7 sm:w-7`)

**4. Debug info row — hide less important info on mobile (lines 1226-1261)**
Hide the ID, Storage/Local indicator, and date on mobile with `hidden sm:flex` on the debug line, keeping only essential info visible.

### Files
- `src/components/app/AppShell.tsx` — add Product Visuals Scenes link
- `src/pages/AdminScenes.tsx` — mobile-responsive SceneRow layout

