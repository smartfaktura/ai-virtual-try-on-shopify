## Product card — clearer selected state

File: `src/components/app/product-images/ProductImagesStep1Products.tsx`, lines 139–143.

The card currently uses `border-primary ring-2 ring-primary/20` when selected, which reads as a faint grey outline against the white card — indistinguishable from unselected. Replace with a strong, unambiguous frame:

- Selected: `border-foreground ring-2 ring-foreground/15 shadow-md`
- Unselected: `border-transparent hover:border-foreground/20`

Keep border width at `border-2` so the card doesn't shift on selection. `CheckCircle` badge stays as-is. No logic changes.
