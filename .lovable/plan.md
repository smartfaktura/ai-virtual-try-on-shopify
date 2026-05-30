# Three small polish fixes

## 1. Analyzing card matches the Upload Image tile layout

Placeholder is structurally identical to the regular product card and the Upload Image tile — same width, same `aspect-square` body, same `h-[44px]` footer band — so it never breaks the grid.

- Body shows the user's uploaded image as a **blurred** background (`object-cover blur-md scale-110 opacity-60`) with a small spinner + "Analyzing…" centered over it.
- Footer band keeps the same `text-[10px]` / `text-[9px]` rhythm.

## 2. Suggested pill — exact style from `/app/products/:id/edit`

Reuse the markup from `ManualProductTab.tsx`:

```tsx
<span className="text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
  Suggested
</span>
```

Failed rows get the same shape with `bg-destructive text-destructive-foreground` reading "Pick one".

## 3. Pill lives INSIDE the Select trigger, right next to the value

This is the part that's been off. In `/app/products/:id/edit` the Suggested pill sits **inside the field**, immediately to the right of the resolved value ("Dress") — not after the field, not above the label.

Implementation in `BulkUploadReviewModal.tsx`:

- Keep the small `CATEGORY` label above the field.
- Render a custom trigger that looks like the shadcn `SelectTrigger` (same border, height, padding, chevron) but whose inner content is:
  ```
  [ Dress  ·  Suggested ]              ▾
  ```
  i.e. the value text on the left, the pill inline next to it, chevron on the far right — all within the same bordered control.
- When the user changes the value, `isSuggested` flips false and the pill disappears (existing behavior).
- Failed rows render the same control with "Pick one" pill inside it instead.

Files touched: `src/pages/ProductImages.tsx` (analyzing card markup), `src/components/app/BulkUploadReviewModal.tsx` (pill style + in-trigger placement).
