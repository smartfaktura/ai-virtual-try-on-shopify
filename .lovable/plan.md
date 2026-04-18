

The user is pointing to the "Back" button in the Product Visuals wizard sticky bar (visible in the screenshot — small grey "Back" text without proper button styling). Looking at `ProductImagesStickyBar.tsx`, the Back buttons use `<Button variant="outline">` with default size which gives `h-10 rounded-lg` — but the user wants it to match the pill style of "Continue".

### Fix

**`src/components/app/product-images/ProductImagesStickyBar.tsx`**

Two Back buttons (mobile line ~67, desktop line ~115) currently:
```tsx
<Button variant="outline" onClick={onBack}>Back</Button>
```

Change to:
```tsx
<Button variant="outline" size="pill" onClick={onBack}>Back</Button>
```

This makes Back render at `h-10 rounded-full` matching the "Continue" pill primary CTA next to it.

### Also check sibling sticky bars for the same issue

- `src/components/app/video/short-film/ShortFilmStickyBar.tsx` — desktop Back uses `<Button variant="outline" size="sm">` (line ~136). Update to `size="pill"` so it matches the primary pill CTA. Mobile Back (line ~78) uses default — change to `size="pill"`.
- Also the desktop Reset / Save ghost buttons on the same bar use `size="sm"` — leave those (they're tertiary text actions), only standardize the Back button to `size="pill"`.

### Acceptance
- Product Visuals wizard: Back button is `h-10 rounded-full` outline pill, visually paired with Continue pill.
- Short Film wizard: Back button matches pill height of Generate/Next pill CTA.

