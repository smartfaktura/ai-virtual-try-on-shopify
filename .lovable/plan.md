# Polish the Review Uploads modal

## 1. Fit "Dress" + Suggested pill inside the field
Right now they touch (`Dress[SUGGESTED]`). Fix:
- Add real `gap-2` between the value and the pill inside the trigger.
- Bump the trigger to `h-10` with `px-3` so the pill breathes.
- Prefix the value with a muted **Category:** label (`text-[10px] uppercase tracking-wider text-muted-foreground`) so the field reads:
  ```
  Category:  Dress   [ Suggested ]            ▾
  ```
- Truncate the value, never the pill (pill is `flex-shrink-0`).

## 2. Rounder corners, consistent with the app
- Thumbnail: `rounded-md` → `rounded-xl` (matches product cards).
- Row container: `rounded-lg` → `rounded-xl`.
- Trigger: keep shadcn default `rounded-md` (already consistent with other inputs).

## 3. Header sizing matches our modal standard
- Title `text-base font-medium` → `text-lg font-semibold tracking-tight` (matches other dialogs like AddProduct).
- Description stays `text-xs text-muted-foreground` but with `leading-relaxed` and no terminal period (per brand rule).
- Tighten header `space-y-1` and dialog `gap-5`.

## 4. Mobile layout
On `< sm` the 64px thumb + field + pill gets cramped. Switch the row to:
- Thumb stays left at 56×56 on mobile, 64×64 on `sm+`.
- Field takes full remaining width; pill wraps to a second visual line inside the trigger only if needed (kept on one line via `min-w-0` + truncation on value).
- Remove (×) button moves from absolute top-right to inline at the far right on mobile so it doesn't overlap the pill.
- Dialog: `max-w-xl` on desktop, full-width with `mx-3` padding and `p-4` on mobile.

## 5. Files touched
- `src/components/app/BulkUploadReviewModal.tsx` — header sizing, row container radius, thumb radius/size, trigger height/padding, in-trigger `Category:` label + gap, mobile remove-button placement.

No logic, analyzer, or save-flow changes.
