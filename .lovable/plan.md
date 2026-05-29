## Goal
Make `/app/video/animate` and `/app/video/start-end` look polished and consistent on mobile (≤390px). Currently AnimateVideo has horizontal overflow and over-padded cards on mobile; StartEnd is mostly fine but needs minor polish to stay in sync.

## Issues found (mobile, 390×844)

**AnimateVideo (`src/pages/video/AnimateVideo.tsx`)**
1. **Horizontal overflow on the Batch Mode card header.** The long description "Upgrade to any paid plan to animate multiple images at once" sits in a `flex` row next to an "Upgrade" pill + `Switch`, with no `min-w-0` / wrapping → pushes the row past viewport, clipping the Upgrade pill and Switch and forcing the whole page to scroll horizontally.
2. **Card padding too large on mobile.** Several cards use `p-6` / `p-8` / `px-6 py-3` unconditionally (Batch Mode header, upload card body, pipeline-active card, error card). Should be `p-4 sm:p-6` / `p-5 sm:p-8`.
3. **Three secondary buttons (`Upload image` / `Choose from Library` / `Paste (⌘V)`) cram into a `flex gap-2` row on mobile** and visually overflow the card. On mobile the third "Paste" button should be hidden (paste isn't a mobile gesture anyway) and the two remaining buttons should be `grid grid-cols-2`.
4. **Pipeline-active card** (line ~1362) uses `p-8` and a 12×12 avatar — too big on mobile. Switch to `p-5 sm:p-8`.

**StartEndVideo (`src/pages/video/StartEndVideo.tsx`)**
1. Audio & Note card uses `p-5 sm:p-6` — fine, keep.
2. Recent-result card uses `p-4 sm:px-5 sm:py-4` but "View video" button + close X may crowd a long timestamp. Add `min-w-0` to the text column and `hidden sm:inline` qualifier on the timestamp prefix.
3. Sticky bottom bar already responsive (`flex-col sm:flex-row`). No change needed.

**Consistency (both)**
- Both pages use the same `max-w-4xl mx-auto py-2 sm:py-4 space-y-6 sm:space-y-8 pb-32` shell — keep as is.
- Both pages use the same `PageHeader` and same sticky bottom CTA pattern — keep consistent.

## Changes

### `src/pages/video/AnimateVideo.tsx`
1. **Batch Mode header (lines ~558–596)**: wrap the inner content row with `min-w-0`, set the title/description `<div>` to `min-w-0 flex-1`, allow the description `<p>` to wrap (`break-words`). Change outer padding from `px-6 py-3` to `px-4 sm:px-6 py-3`. Wrap the Switch + Upgrade pill cluster in `shrink-0`.
2. **Upload card body (line ~598)**: `p-6` → `p-4 sm:p-6`.
3. **Secondary buttons row (lines ~667–700)**: change from `flex items-center gap-2` to `grid grid-cols-2 sm:grid-cols-3 gap-2`. Hide the "Paste (⌘V)" button on mobile (`hidden sm:inline-flex`). Reduce label on mobile: keep "Upload image" / "Choose from Library" but allow `truncate`.
4. **Pipeline-active card (line ~1362)**: `p-8` → `p-5 sm:p-8`; avatar `w-12 h-12` → `w-11 h-11 sm:w-12 sm:h-12`.
5. **Error card (line ~1423)**: `p-6` → `p-4 sm:p-6`.
6. **Sticky CTA bar (line ~1319)**: already `p-4 sm:p-5 flex-col sm:flex-row` — no change.

### `src/pages/video/StartEndVideo.tsx`
1. **Recent-result card (lines ~273–301)**: add `min-w-0` to the text column; wrap timestamp prefix "Generated " in `hidden sm:inline` so mobile shows only the date.
2. No other changes — page is structurally clean.

## Out of scope
- No logic changes (no pipeline, no credit math, no upload/handler changes).
- No StartEnd refactor — only the small text-column tweak.
- No PageHeader changes (shared component, already responsive).
- No desktop visual changes — all edits are mobile-first additions (`p-4 sm:p-6`, `grid-cols-2 sm:grid-cols-3`, `hidden sm:inline-flex`).

## Verification
Re-screenshot both pages at 390×844 after edits and confirm:
- No horizontal page scroll on AnimateVideo
- Batch Mode header fits in viewport with Upgrade pill + Switch fully visible
- Secondary buttons fit cleanly in 2 columns on mobile, 3 on sm+
- StartEnd layout unchanged on desktop, recent-result card tidy on mobile
