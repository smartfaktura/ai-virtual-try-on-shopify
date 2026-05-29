# Show "Suggested" pill on category field after AI analysis

## Problem

After the analyzer fills in the Product Category in both the single Add Product modal and the bulk Add Products rows, the field just reads "Dresses" with no indication it was AI-suggested. The "Suggested" pill currently only appears *inside* the picker dropdown — never on the visible trigger.

## Fix (UI only, `src/components/app/ManualProductTab.tsx`)

### A. Single Add Product modal (lines ~1166–1190)
- State `suggestedCategory` already exists from the analyzer.
- Add a tiny `Suggested` pill (same styling as the one in `CategoryPickerModal`: `bg-primary text-primary-foreground`, `text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full`) next to the category label on the trigger button, shown when `userCategory === suggestedCategory && suggestedCategory != null`.
- Hide it as soon as the user manually picks a different category (i.e. `userCategory !== suggestedCategory`).

### B. Bulk row picker (~line 856) + inline trigger (~line 817)
1. Extend `BulkProductItem` with `suggestedCategory: string | null`. Initialize `null` in every constructor (initial state, `addMore`, reset paths).
2. In the analyzer callback (around line 207-218), when `data.userCategory` arrives, write it to both `userCategory` (if user hasn't edited) and `suggestedCategory` (write-once).
3. Pass `suggested={item.suggestedCategory ?? null}` when opening the picker so the in-modal pill works too.
4. Render the same `Suggested` pill in the row's category cell (~line 748) and inline trigger (~line 817), gated on `item.userCategory === item.suggestedCategory && item.suggestedCategory`.

## Safety
- No backend / DB / RLS / edge function changes.
- `userCategory` (the value saved to DB) remains the single source of truth.
- `suggestedCategory` is session-only metadata — never persisted, never overwrites user edits.
- Pill disappears the moment user changes the category — no stale "Suggested" labels.
- Falls back gracefully when analyzer returns `null` (no pill).

## Out of scope
- No analyzer prompt or edge function changes.
- No persistence of "was suggested" to DB.
- No styling changes to the picker dropdown itself (already correct).
