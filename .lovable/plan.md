Fix the sidebar credit indicator overflow without abbreviating numbers — keep full `1,000 / 1,000` formatting.

**File:** `src/components/app/CreditIndicator.tsx`

**Change**
- Tighten balance font sizing so 4–5 digit balances fit alongside the pill:
  - 1–3 digits → `text-2xl`
  - 4 digits → `text-lg` (down from `text-xl`)
  - 5+ digits → `text-base`
- Add `tabular-nums leading-none` to the balance span for stable width.
- Shrink the divider/max text slightly: keep `text-[11px]`, but add `tabular-nums` and `truncate`.
- Reduce the CTA pill width: `h-8 px-3` (was `px-3.5`) and `text-[11px]` (was `text-xs`) — saves ~6–8px without losing legibility.
- Add `min-w-0` to the balance flex group so the pill always wins layout priority and never gets clipped off-row.

No abbreviation, no layout restructure, no behavior change. Pill and progress bar stay where they are.

**Scope:** one file.