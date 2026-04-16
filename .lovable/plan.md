

# Unified Bullet Points + Badge Repositioning + Size Tweaks

## Changes (both `BuyCreditsModal.tsx` and `NoCreditsModal.tsx`)

### 1. Move "Most popular" badge inside card — top-right corner
Replace the centered `absolute -top-2.5 left-1/2 -translate-x-1/2` positioning with `absolute top-3 right-3` so it sits inside the card at the top-right corner. Remove the outer `pt-4` padding that was compensating for the external badge.

### 2. Slightly bigger price
Change price from `text-2xl` to `text-3xl`. Keep `/mo` at `text-sm`.

### 3. Merge metrics + differentiators into one unified bullet list with check marks
Instead of two separate sections (plain text metrics, then check-mark differentiators), combine everything into a single list where every line gets the same `Check` icon. Order per plan:

**Starter:**
- ~100 images / month
- 500 credits / month
- $0.078 per credit (no bold — use badge style like "SAVE 20%" for annual savings)
- Bulk generations
- Up to 100 products

**Growth:**
- ~300 images / month
- 1,500 credits / month
- $0.053 per credit
- Faster generation
- Up to 250 products
- Brand Models `NEW`

**Pro:**
- ~900 images / month  
- 4,500 credits / month
- $0.040 per credit
- Fastest generation
- Unlimited products
- Brand Models `NEW`

All items rendered with `Check` icon, `text-xs text-muted-foreground`. Price-per-credit line: no `font-semibold`, just regular weight with `text-primary` color. When annual billing is active, add a small badge like `SAVE 20%` next to the per-credit line.

### 4. Slightly bigger bullet text
Change bullet text from `text-xs` to `text-[13px]` for better readability.

## Files Changed

| File | Change |
|------|--------|
| `BuyCreditsModal.tsx` | Badge position, price size, unified bullet list |
| `NoCreditsModal.tsx` | Same changes |

