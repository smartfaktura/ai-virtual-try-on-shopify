

# Plan Card Visual Polish — Both Modals

## Changes

### 1. Descriptors in UPPERCASE
Change `PLAN_DESCRIPTORS` values to uppercase: `'BEST TO START'`, `'BEST VALUE'`, `'FOR SCALE'`. Apply in both files.

### 2. Title & subtitle 2px bigger
- Modal title: `text-lg` → `text-xl` (both modals)
- Subtitle: `text-[13px]` → `text-sm` in BuyCreditsModal, `text-sm` → `text-[15px]` in NoCreditsModal

### 3. Bullet points 1px bigger
- `text-sm` (14px) → `text-[15px]` for all bullet text in both modals

### 4. Full popup background same color as card wrapper
- BuyCreditsModal: add `bg-muted/50` to the outer `DialogContent` or content wrapper so the whole modal background matches the card grid area
- NoCreditsModal: same — apply `bg-muted/50` to the content area, remove the separate `bg-muted/50` from just the grid wrapper since the whole popup is now that color

### 5. Growth card — primary color alternative design
For the Growth (highlighted) plan card only:
- Background: `bg-primary text-primary-foreground` 
- All text inside: white (`text-primary-foreground`, `text-primary-foreground/70`)
- Check icons: `text-primary-foreground/60` instead of `text-primary/60`
- CTA button: `variant="secondary"` (white button on primary bg)
- Badge styling inside: `bg-primary-foreground/20 text-primary-foreground`

### 6. Badges — bigger with padding and bold
All inline badges (NEW, SAVE %): 
- `text-[9px]` → `text-[10px]`
- Add `py-0.5` padding (currently `py-0`)
- Add `font-bold` (currently no bold)

### 7. Price-per-credit line — no bold
Ensure the per-credit text has no `font-semibold` or `font-bold`. Keep it regular weight with `text-primary` color (or `text-primary-foreground` inside Growth card).

### 8. SAVE % badge — same font as other text
Remove any special styling on SAVE badge text. Use same `text-[10px] font-bold` as NEW badge. Already handled by unified badge styling in point 6.

### 9. "Most popular" badge — bigger + uppercase
- `text-[10px]` → `text-[11px]`
- Add `uppercase tracking-wider`
- Add `font-bold`

### 10. Card hover shadow
Add `hover:shadow-lg` to all non-highlighted cards (already partially there). For highlighted Growth card, add `shadow-lg hover:shadow-xl`.

## Files
- `src/components/app/BuyCreditsModal.tsx`
- `src/components/app/NoCreditsModal.tsx`

