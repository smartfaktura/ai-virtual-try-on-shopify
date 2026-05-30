Update the upload review row so the selected category and status badge no longer collide.

Implementation plan:

```text
[image]  CATEGORY                                      [x]
         [ Dress                         Suggested ▾ ]
```

- Keep `Category` as a small label above the select field, not inside the placeholder
- Change the select trigger layout to `justify-between` so the selected value stays left and the `Suggested` badge stays right
- Add clear spacing between `Dress` and `Suggested` using a dedicated right-side badge area
- Make the badge smaller and less visually heavy, with `ml-3`/`gap-3` and stable shrink behavior
- Ensure mobile works by letting the value truncate before it reaches the badge, rather than squeezing everything together
- Keep the existing rounded corners and modal styling consistent with the app

File to update: `src/components/app/BulkUploadReviewModal.tsx`