

## Problem

When balance is large (e.g. 8,000+), the number wraps/truncates as "8,..." in the sidebar credits card because `text-2xl` + the `/ max` suffix + the Upgrade pill don't fit the sidebar width.

## Fix

In `src/components/app/CreditIndicator.tsx`:

1. **Make balance shrink gracefully** — wrap the number in a `min-w-0 flex-1` container so flexbox can actually shrink it instead of overflowing.
2. **Auto-scale font size by digit count**: 
   - ≤3 digits → `text-2xl`
   - 4 digits (1,000–9,999) → `text-xl`
   - ≥5 digits (10,000+) → `text-lg`
   This keeps the premium feel for normal balances and avoids truncation for large ones.
3. **Compact large numbers in the `/ max` suffix only** when ≥10,000 (e.g. `/ 4.5K` instead of `/ 4,500`) to save horizontal space. Balance itself stays full ("8,231") because the actual number matters.
4. **Remove `truncate`** from the balance — with proper sizing it shouldn't truncate. Add `whitespace-nowrap` instead so the comma-formatted number stays intact.
5. **Tighten gap** between number and `/max`: `gap-1.5` → `gap-1` to reclaim a few px.

No changes to logic, CTA, modal, or progress bar.

## Expected result

- 20 / 20 → looks the same (large, premium)
- 8,231 / 4,500 → balance renders fully, slightly smaller font, no truncation
- 12,500 / 4,500 → balance renders as `12,500 / 4.5K`, fits cleanly

