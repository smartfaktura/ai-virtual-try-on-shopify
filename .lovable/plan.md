
## What’s happening

I checked the code and found the mismatch.

The styles were already updated in `src/components/app/NoCreditsModal.tsx`, but the popup you’re likely looking at on your current screen is `src/components/app/BuyCreditsModal.tsx`.

That second modal still has the old styling:
- selected `Monthly / Annual` pills still use primary colors
- the annual `SAVE 20%` chip is still primary-colored
- inline `SAVE` / `NEW` badges in the plan bullets are still primary-colored

So you didn’t see the change because the earlier update went into the wrong plans popup.

## Plan

### 1. Update the actual plans popup you’re seeing
Edit `src/components/app/BuyCreditsModal.tsx` and restyle the billing toggle so it looks like a neutral segmented control instead of a main CTA.

Change selected state from:
- `bg-primary text-primary-foreground shadow-sm`

To something like:
- `bg-card text-foreground shadow-sm border border-border/60`

Keep unselected state muted:
- `text-muted-foreground hover:text-foreground`

### 2. Make the savings and feature badges light grey in that same popup
In `src/components/app/BuyCreditsModal.tsx`, change:
- annual `SAVE 20%` chip
- inline `SAVE ...%` badges
- inline `NEW` badges

To a quiet light-grey treatment such as:
- `bg-gray-100 text-gray-500`

### 3. Keep CTA hierarchy intact
Do not change:
- `Get Starter`
- `Get Growth`
- `Get Pro`

Those stay as the strongest actions.

### 4. Leave logic untouched
No pricing, checkout, modal behavior, or plan logic changes.
This is a styling-only correction.

## Technical details

- Main file to update: `src/components/app/BuyCreditsModal.tsx`
- Key areas:
  - billing toggle around lines `309–337`
  - plan bullet badges around lines `471–480`

`src/components/app/NoCreditsModal.tsx` already has the neutral toggle / grey badge styling, so the fix is mainly to bring `BuyCreditsModal` in line with it.

## Expected result

After this fix:
- `Monthly / Annual` looks like a selector, not a primary button
- `SAVE` and `NEW` badges appear light grey
- the actual plan CTA buttons remain the main visual focus
- the popup finally matches what you asked for
