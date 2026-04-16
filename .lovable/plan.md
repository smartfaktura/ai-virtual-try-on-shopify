

# White Cards, Save % Badges, Badge Styling & Size Tweaks

## Changes (both `BuyCreditsModal.tsx` and `NoCreditsModal.tsx`)

### 1. White card backgrounds with darker container
- Card containers: add `bg-white dark:bg-card` (force white in light mode)
- Outer wrapper/container behind the cards: add `bg-muted/50 rounded-2xl p-4` to create a subtle darker backdrop that makes white cards pop

### 2. Save % badge on per-credit price (vs Starter baseline)
Calculate savings relative to Starter's per-credit cost. Starter is the baseline (no badge unless annual). Growth and Pro show e.g. "SAVE 32%" comparing their per-credit cost to Starter's. When annual billing is active, show the annual-adjusted savings instead.

Formula: `savePercent = Math.round((1 - thisPPC / starterPPC) * 100)`

- Starter: no save badge (unless annual → "SAVE 20%")
- Growth: e.g. "SAVE 32%" (monthly) or "SAVE 46%" (annual)
- Pro: e.g. "SAVE 49%" (monthly) or "SAVE 59%" (annual)

### 3. Badge styling — primary color with white text
Change all inline badges (NEW, SAVE %) from `bg-emerald-500/15 text-emerald-600` to `bg-primary text-primary-foreground` for brand consistency.

### 4. Typography size bumps
| Element | Current | New |
|---------|---------|-----|
| Bullet text | `text-[13px]` | `text-sm` (14px) |
| Price number | `text-3xl` | `text-4xl` |
| "/mo" suffix | `text-sm` | `text-base` |

## Files Changed

| File | Change |
|------|--------|
| `BuyCreditsModal.tsx` | All 4 changes above |
| `NoCreditsModal.tsx` | Same |

