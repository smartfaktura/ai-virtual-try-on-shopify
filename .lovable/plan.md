

# Fix Pricing Modal Visual Issues

## Changes (both `BuyCreditsModal.tsx` and `NoCreditsModal.tsx`)

### 1. Remove Growth card alternative color design
Revert the highlighted Growth card from `bg-primary text-primary-foreground` back to `bg-white dark:bg-card` with a `border-2 border-primary` highlight. Remove all the conditional `isHighlighted` text color overrides (the ternaries checking for highlighted). The "MOST POPULAR" badge stays but uses `bg-primary text-primary-foreground` on a white card.

### 2. Add "No watermarks on AI images" to Starter
Add `{ text: 'No watermarks on AI images' }` to Starter's differentiators in `PLAN_EXTRAS` / `PLAN_DIFFERENTIATORS`.

### 3. Unify popup background — single color throughout
- **BuyCreditsModal**: The content area already has `bg-muted/50`. Remove the nested `bg-muted/50 rounded-2xl p-4` wrapper on the plan grid so cards sit directly in the content area. The whole popup uses one consistent background.
- **NoCreditsModal**: Similarly, remove the `bg-muted/50` wrapper from the grid div. Apply `bg-muted/50` to the entire modal content area (header + body) so there's one uniform tone. Remove `bg-gradient-to-b from-muted/60 to-background` from the header.

### 4. Remove special color on price-per-credit text
Remove `color: 'text-primary'` from the per-credit bullet. All bullet points use the same `text-muted-foreground` color — no special coloring for any line.

## Files
- `src/components/app/BuyCreditsModal.tsx`
- `src/components/app/NoCreditsModal.tsx`

