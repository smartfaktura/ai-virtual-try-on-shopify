# Product Details cleanup + Category picker redesign

## 1. Product Details form (`ManualProductTab.tsx`, single-edit view)

- **Remove** the "Product Type" `Input` (lines 1164-1177) and the "Change category" quick-chips block below it (lines 1180-1208). `productType` state stays so save/load logic and DB writes (`product_type` column) continue working — it's just no longer shown to the user.
- **Promote Product Category** into the freed slot. New layout: two-column grid → left = `Product Name *`, right = `Product Category`. Description + Dimensions stay as the next row.
- **"Suggested" pill**: when `!userCategory && suggestedCategory`, render a small badge inside the category trigger button:
  - `bg-primary text-primary-foreground` (primary dark blue, white text), rounded-full, text-[10px], uppercase tracking, `px-2 py-0.5`, label `Suggested` (no sparkles icon).
  - Sits to the right of the category label, left of the pencil icon.
- Keep the pencil edit affordance on the trigger.

## 2. CategoryPickerModal redesign

- **Width**: bump `max-w-2xl` → `max-w-3xl`, container `rounded-3xl` (matches the "super big rounding" elsewhere). Increase padding (`px-8 pt-8 pb-6`).
- **Header copy** (shorter): title `Product category`, description `Pick the closest match for better scene results` (single short line).
- **Search input**: taller (`h-11`), `rounded-2xl`, larger placeholder, full-width, subtle muted background (`bg-muted/40`), search icon `w-4 h-4`. Placeholder: `Search categories`.
- **Suggested at top**: when `suggested` exists, render a dedicated section above the groups titled `SUGGESTED`, containing only that one category as a single full-width pill with the same primary-blue `Suggested` badge.
- **Category buttons**: switch grid from `gap-1.5` → `gap-2`, buttons from `rounded-md py-2` → `rounded-2xl py-3 px-4`, `text-sm`, more breathing room. Selected = primary fill; suggested-in-grid = subtle primary tint; default = `border-border/60 hover:bg-muted`. Drop the inline `Sparkles` icon on suggested items inside the grid (suggestion now lives only in the dedicated top section).
- **Group labels**: keep tiny uppercase, add a little more spacing (`space-y-6` between groups, `mb-3` under label).
- **Scroll area**: `max-h-[65vh]`.

## 3. Mobile UX

- Modal: on `sm:` breakpoint and below, content goes near full-screen — `max-w-[100vw] h-[100dvh] sm:h-auto sm:max-w-3xl`, rounded only on desktop (`sm:rounded-3xl rounded-none`), sticky header with search, scroll body fills remaining space. Suggested section pinned at the very top of the scroll body.
- Category grid collapses to `grid-cols-1` on mobile (currently `grid-cols-2 sm:grid-cols-3`) so each pill is big and easily tappable; `sm:grid-cols-2 md:grid-cols-3`.
- Category trigger button in the form: keep `h-9` on desktop, `h-11` on mobile so the badge has room.

## 4. Out of scope

- Batch-mode card still keeps its Product Type input + chips for now (asked only about the single-edit form / screenshot). Can do batch in a follow-up if you want.
- No DB schema changes. `product_type` column keeps being written from whatever Step 2 / AI fills; we just stop showing the field.

## Files touched

- `src/components/app/ManualProductTab.tsx` — remove Product Type UI block, move Category into the grid, add Suggested badge.
- `src/components/app/product-images/CategoryPickerModal.tsx` — full visual redesign + mobile sheet behavior + Suggested-at-top section + shortened copy.
