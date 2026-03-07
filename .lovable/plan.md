

## Fix Credit Progress Bar: Visibility and Top-Up Logic

### Problem 1: Bar too dark
Looking at the live sidebar, the `bg-white/[0.4]` track on top of the `bg-white/[0.06]` card background results in roughly `~18%` white opacity — still very dark against the navy sidebar. The primary fill is also dark (navy-ish primary), making the whole bar nearly invisible.

### Problem 2: Top-up credits break the bar logic
Current logic in `usagePercent`:
- Free plan: `monthlyCredits = 20`
- User buys 500 credits → `balance = 520`
- `hasBonus = 520 > 20` → `usagePercent = 100%`
- Display: `520 / 20` — confusing, bar is permanently full

Same issue for any plan where `balance > monthlyCredits` after a top-up. The denominator and bar become meaningless.

### Fix in `src/components/app/CreditIndicator.tsx`

**Visibility fix:**
- Replace the subtle `bg-white/[0.4]` track with a solid, clearly visible light color: `bg-slate-400/50` — this renders as a medium-gray bar that stands out against the dark sidebar
- Give the fill a brighter, more saturated appearance

**Top-up logic fix:**
- When `balance > monthlyCredits` (and not infinite), show the balance as `{balance}` with a small "+{bonus}" indicator instead of the misleading `/ 20`
- The denominator should reflect the effective total: `max(monthlyCredits, balance)` so the bar scales properly
- If user is on free plan with topped-up credits, the bar should show proportion used of their actual balance, not of 20

```text
Scenarios:
  Free (20/mo), no top-up:     "15 / 20"     bar = 75%
  Free (20/mo), bought 500:    "520"          bar = 100% (full = good, you have plenty)
  Pro (4500/mo), no top-up:    "3,904 / 4,500" bar = 87%
  Pro (4500/mo), bought extra: "5,200 / 4,500" bar = 100% + bonus indicator
```

Specifically:
- Compute `displayTotal = hasBonus ? balance : monthlyCredits`
- `usagePercent = (balance / displayTotal) * 100` — always 100% when over quota (which is fine — it means "you're good")
- When `hasBonus`, hide the `/ total` denominator and show a small green "+{bonus}" badge instead
- Track: `bg-slate-400/60` for maximum contrast
- Fill: keep `bg-primary` but ensure it contrasts against the new lighter track

### Files changed
- `src/components/app/CreditIndicator.tsx`

