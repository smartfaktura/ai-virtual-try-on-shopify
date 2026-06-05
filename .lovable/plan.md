## Goal

Make the "save swatch" affordance obvious, let users rename and delete saved swatches inline, and make the strip work well on mobile.

## Changes in `src/pages/MaterialSwap.tsx`

### 1. Replace the star with a real "Save" icon + label

- On each material card in the batch, swap the `Star` icon for `Bookmark` (outlined when not saved) / `BookmarkCheck` (filled accent when saved). Bookmark reads as "save for later" much more clearly than a star (which users associate with favorites/rating).
- On mobile (`<sm`), the card layout becomes: thumbnail + name input on row 1, and a small action row underneath with `[ Save ] [ Remove ]` text buttons (icon + label) so the intent is unambiguous and tap targets are 36px+.
- On desktop, keep the compact icon-only buttons, but with a tooltip "Save for next time" / "Saved — tap to remove".

### 2. Saved swatches strip becomes a manageable gallery

Replace the current 64×64 click-to-add buttons with a richer card:

```
┌──────────────────────────┐
│   [thumbnail 88×88]      │
│   Anthology 7 Mocc       │  ← inline name (click to edit)
│   [ Add ]   [ ⋯ ]        │  ← Add to batch | menu (Rename / Delete)
└──────────────────────────┘
```

- Horizontal scroll on mobile (snap-x), 2-column auto-fit on `sm+`.
- Name is editable inline (click the text → it becomes an input, blur/Enter saves via `update`).
- Three-dot menu (`MoreHorizontal`) opens a small dropdown with **Rename** and **Delete** (with confirm toast). Reuses existing `DropdownMenu` shadcn primitive already in the project.
- Selected/in-batch state shows a subtle "In batch" pill instead of a plus overlay.
- Header line stays terse: `Your saved swatches · 1/50` (no separate subtitle paragraph — the action button is self-explanatory).

### 3. Mobile polish

- Saved strip: `overflow-x-auto snap-x snap-mandatory` with `min-w-[160px]` cards so they don't squish.
- Batch material cards stack vertically inside the card on `<sm` (thumbnail on top-left, input fills remaining width, action row below).
- All buttons sized `h-9` minimum on touch, `h-7` on desktop.

### 4. Name on save

- When the user taps Save on a freshly uploaded swatch, save it with the label currently in the input. (Already the case — confirmed.) Add a small inline hint under the input the first time a user saves something: "Tip: name it first so it's easy to find later". Dismissed via `localStorage` flag `vovv.mswap.save-hint-seen`.

## Hook change (`src/hooks/useSavedMaterials.ts`)

- Add `rename(id, label)` that calls `update({ label }).eq('id', id)`, mirroring `remove`.
- Trim + cap label at 80 chars, default to `'Material'`.

## Out of scope

- No backend / RLS changes (table already supports update via existing policy).
- No changes to swap pipeline, pricing, or step 1/3.

## Total surface

- 1 hook gets one new method (~12 lines).
- `MaterialSwap.tsx` step 2 saved-strip and material-card sections rewritten (~80 lines changed).
