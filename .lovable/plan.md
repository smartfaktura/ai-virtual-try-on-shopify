

## The "+502" display is confusing — here's what it means and how to fix it

### What's happening now

The `CreditIndicator` component compares your balance (5,002) against Pro plan's monthly allocation (4,500). Since 5,002 > 4,500, it calculates a "bonus" of 502 and shows it as `+502` in green — meaning "502 credits above your plan's monthly allowance."

The problem: it looks like **5,002 + 502 = 5,504 total**, which is misleading. The 502 is already included in the 5,002.

### Proposed fix

Replace the confusing bonus display with a clearer breakdown. Two options:

**Option A — Show total only, with "of plan" context:**
```
5,002 / 4,500
```
When over the plan limit, just show the total without the confusing green number. The progress bar being full already signals you're above quota.

**Option B — Show breakdown as tooltip or secondary line:**
```
5,002 credits
4,500 plan + 502 purchased
```

I'd recommend **Option A** — simplest, no confusion. The green `+502` just gets removed when balance exceeds the plan quota, and the display becomes:

```
5,002  (no suffix shown — progress bar at 100%)
```

### Change

**`src/components/app/CreditIndicator.tsx`** — remove the `hasBonus` branch entirely. Always show `balance / monthlyCredits` format. When balance > monthlyCredits, the progress bar stays full at 100%.

