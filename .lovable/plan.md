# Polish: `/app/video/start-end` — match the VOVV.AI app aesthetic

## What's wrong today

Looking at the current page vs. polished pages like `/app/video/animate`:

- Upload tiles are forced **square** (`aspect-square`) with a thin dashed border, generic gray icon, and a tiny "Drop, paste, or browse" line. They feel empty and crowded at the same time.
- The two slots use a 1:1 grid with a tight 16 px gap, so on wide screens the placeholders look like enormous empty rectangles with a tiny ChevronRight chip overlapping the center.
- Cards (Goal, Refinement, Preservation, Audio, Summary) all use the same `rounded-xl border bg-card p-4` recipe with `text-sm font-medium` headers — no breathing room, no hierarchy, no soft shadows like the rest of the app uses (`rounded-2xl shadow-sm p-5–p-6`).
- The Library picker modal is a plain dialog with a small title, no header padding, generic grid, no hover preview polish, no empty state polish.
- The sticky generate bar sits at `bottom-4` with `rounded-xl` — visually disconnected from the content above.

## Goals

Bring this page in line with `AnimateVideo` / `ProductImages` polish: softer rounding (2xl/3xl), generous padding, a real "frame slot" placeholder (large icon-in-circle, primary tint, two clear buttons), a centered direction chip that doesn't overlap the artwork, and a richer Library modal.

## Changes

### 1. `StartEndUploadPair.tsx` — restyle frame slots

- Drop `aspect-square`. Use `aspect-[4/5]` (matches the editorial/portrait expectation) on each slot, capped with `min-h-[280px] sm:min-h-[340px]`.
- Container: `rounded-3xl border-2 border-dashed border-primary/15 bg-gradient-to-b from-primary/[0.02] to-muted/10 hover:border-primary/30 hover:from-primary/[0.04]` — same recipe AnimateVideo uses for its hero uploader.
- Drag-over state uses `border-primary/60 bg-primary/[0.06]`.
- Empty placeholder content (centered, generous spacing):
  - Big circle icon: `h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center` with `Upload` (start slot) or `Flag` (end slot, lucide) — distinguishes the two.
  - Bold label: "Start frame" / "End frame" (`text-sm font-semibold`).
  - Sub: `text-xs text-muted-foreground` — "Drop, paste, or click to browse".
  - Two side-by-side buttons (`Button variant="outline" size="sm" className="h-8 text-xs"`): `Upload` and `Library` (Folder icon). Stack on `<sm`.
  - Tiny hint line under buttons: `JPG · PNG · WebP — up to 20 MB`.
- When an image is loaded:
  - Image fills the slot (`object-cover`).
  - Top-left chip restyled to `rounded-full px-2.5 py-1 bg-background/90 backdrop-blur shadow-sm text-[11px] font-medium`.
  - Top-right close: `rounded-full p-1.5 bg-background/90 backdrop-blur shadow-sm hover:bg-background`.
  - Aspect ratio mini-badge bottom-left (e.g. "9:16") for clarity.
- Pair layout:
  - Wrap both slots in a `grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6`.
  - Direction chip (between slots): a 44 px pill with `rounded-full border border-border bg-background shadow-md flex items-center gap-1 px-3` showing `Start → End` text, sitting **on top** at the centerline (`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10`). On mobile, becomes a horizontal label between the stacked slots: `← stack ArrowDown chip`.

### 2. `LibraryPickerModal.tsx` — premium polish

- DialogContent: `max-w-3xl rounded-2xl p-0 overflow-hidden` (currently `max-w-2xl` with default padding).
- Header bar with its own padding `px-6 pt-5 pb-4 border-b border-border`:
  - Title `text-lg font-semibold` + small subtitle `text-xs text-muted-foreground` ("Pick an image from your saved library").
  - Search input moves into the header bar, full-width, `h-10 rounded-xl pl-10 bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary/30`.
- Grid area:
  - Background `bg-muted/20`, padding `p-5`, scroll area `max-h-[60vh]`.
  - `grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3`.
  - Each tile: `rounded-xl overflow-hidden ring-1 ring-border hover:ring-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group` with subtle `group-hover:scale-[1.02]` on the image.
  - Selected state: `ring-2 ring-primary` + checkmark badge already exists but shrinks to `h-6 w-6`.
  - Add a soft hover overlay revealing the label.
- Empty state: bigger illustration, friendlier copy — "Your library is empty. Generate or upload images first."
- Footer (only when single-select): a slim `px-6 py-3 border-t border-border bg-background flex items-center justify-between` with text "Pick a frame to insert" + a Cancel ghost button.

### 3. Section cards (Goal, Refinement, Preservation, Audio+Note, Summary)

Apply a unified premium card recipe across all of them:

- `rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6 space-y-4`.
- Header row: `flex items-center justify-between` with `text-base font-semibold tracking-tight` title and a small muted description below it (or right side).
- Goal grid: button tiles become `rounded-xl border p-3.5 min-h-[96px] hover:shadow-sm hover:-translate-y-px transition-all`. Selected: `border-primary bg-primary/[0.04] ring-1 ring-primary/20`. Title `text-sm font-semibold`, description `text-[11.5px] text-muted-foreground mt-1 leading-relaxed`.
- Refinement segmented buttons: `h-8 rounded-full px-3 text-[11.5px]` — rounded pills feel more premium than current rounded-md squares.
- Summary card: change container background to `bg-gradient-to-b from-muted/40 to-muted/10`, title `text-base font-semibold`, rows use `py-2 text-[12.5px]` with `divide-y divide-border/40`.

### 4. Page header & sticky generate bar

- Wrap the page body in `container max-w-5xl py-8 space-y-6` (currently `max-w-4xl py-6`) — a touch more breathing room matches the rest of the app.
- Page title size already comes from `PageHeader`; add a small "BETA" pill next to the title (matches Catalog Studio convention).
- Sticky bar: change to `rounded-2xl border border-border bg-background/90 backdrop-blur-md shadow-lg shadow-foreground/[0.04] p-4 bottom-6`. Generate button becomes `size="lg" className="min-w-[240px] rounded-xl"` with a subtle gradient `bg-gradient-to-r from-primary to-primary` on hover.

### 5. CompatibilityCard

- Card: `rounded-2xl shadow-sm p-5`.
- Tier pill larger: `px-3 py-1 text-[11.5px]`.
- Reason text `text-sm` and recommendation `text-[12.5px] text-muted-foreground`.
- Shared elements as `rounded-full px-2.5 py-1 bg-muted` chips.

## Files touched

- `src/components/app/video/start-end/StartEndUploadPair.tsx` (major)
- `src/components/app/video/LibraryPickerModal.tsx` (major)
- `src/components/app/video/start-end/TransitionGoalSelector.tsx` (medium)
- `src/components/app/video/start-end/TransitionRefinementPanel.tsx` (small)
- `src/components/app/video/start-end/CompatibilityCard.tsx` (small)
- `src/components/app/video/start-end/TransitionSummaryCard.tsx` (small)
- `src/pages/video/StartEndVideo.tsx` (container width, sticky bar, audio+note card recipe, BETA pill)

No backend, hook, or routing changes — purely presentational. All semantic design tokens (`primary`, `border`, `muted`, `card`, `background`) — no hardcoded colors.

## What stays the same

- Pipeline behavior, preflight, compatibility analysis, prompt builder, generation flow.
- LibraryPickerModal API (`open`, `onOpenChange`, `onSelect`, `multiSelect`, `onMultiSelect`, `maxSelect`) is unchanged so every other caller (Animate, Short Film, etc.) keeps working.
