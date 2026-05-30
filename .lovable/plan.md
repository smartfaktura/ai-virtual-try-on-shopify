# Move "Category" out of the field

The label is crammed inside the trigger and overlaps the value. Fix:

## Layout per row
Two rows of content stacked next to the thumbnail:
```
[thumb]   CATEGORY                              [×]
          [ Garment              Suggested  ▾ ]
```
- Tiny `CATEGORY` label sits **above** the field as a regular form label (`text-[10px] uppercase tracking-wider text-muted-foreground`, `mb-1`).
- The SelectTrigger only contains: value (truncated, flex-1) + Suggested/Pick-one pill + chevron. Plenty of room now.
- Trigger height stays `h-10`, padding `px-3`.

## Row container
- `flex items-start` (top-aligned) so the label + field column lines up with the thumb's top edge.
- Thumb: `w-14 h-14 sm:w-16 sm:h-16 rounded-xl`, aligned with `mt-[18px]` so it visually centers against the field (label + field combined).
  Simpler: align thumb to the field by giving the label a fixed height equal to `mt-0` on thumb and label sitting above — center the thumb vertically with the **field row** by making the right column `flex flex-col` and giving the thumb `self-end mb-0` so it bottom-aligns with the field. Cleanest: keep `items-center` on the outer row and let the label sit as a small line above the field; the thumb visually centers against the (label+field) block.
- Remove `×` button stays inline far right, vertically centered.

## File
- `src/components/app/BulkUploadReviewModal.tsx` only.

No logic changes.
