## Refine the "Current Plan" panel on /app/settings

The card today crams 5 different type sizes, 2 badges, a thin link, a hairline credits row and a 2-button grid into ~220px. The goal is a calmer, more VOVV editorial block.

### Layout & spacing
- Increase card padding to `p-7 sm:p-9` and switch to a vertical rhythm of `space-y-6` (instead of `space-y-3`).
- Split the card into 3 clear bands with subtle dividers (`border-border/60`):
  1. Plan identity
  2. Credits usage
  3. Billing actions

### Band 1 — Plan identity
- Eyebrow: `text-[11px] uppercase tracking-[0.18em] text-muted-foreground` → "Current plan".
- Display row: plan name as `text-2xl font-semibold tracking-tight` (e.g. "Pro"), with billing interval as a small pill to the right.
- Beneath: a single quiet line `text-sm text-muted-foreground` → `$179/mo · Renews May 27, 2026`.
- Move "Switch to annual & save 20%" to a right-aligned text link on the same baseline as the price line (no longer a stranded mini link).
- Drop the inline `Pro` badge next to the H3 (redundant with the large plan name).

### Band 2 — Credits usage (the "tiny line" fix)
- Label row: "Credits used this cycle" (left, `text-sm text-muted-foreground`) + large numeric `text-2xl font-semibold tabular-nums` on the right (e.g. `4,816 / 4,500`).
- Replace the 6px progress bar with a `h-2.5 rounded-full` bar using `bg-muted` track and `bg-foreground` fill, plus a subtle 1px inner border for depth.
- Add a helper line under the bar: `text-xs text-muted-foreground` → e.g. `Resets in 12 days · Top up anytime`.

### Band 3 — Billing actions
- Keep the 2-button grid but increase to `h-11`, `gap-3`, and use `rounded-xl` instead of pill so it matches the card's calmer geometry.
- Primary: "Top up credits" (filled). Secondary: "Manage billing & invoices" (outline/secondary). Same icons, slightly larger (`w-4 h-4`).

### Typography cleanup
- Only 3 type sizes in the card: eyebrow (11px), body (14px), display (24px). No more 10px badge + 12px link + 14px body + 16px h3 mix.
- All numerics use `tabular-nums`.
- Remove terminal periods on single-sentence subtitles per Core memory.

### Files
- `src/pages/Settings.tsx` lines 460–524 only. No business logic changes — same data sources (`planConfig`, `balance`, `creditsTotal`, `currentPeriodEnd`, `handlePortal`, `openBuyModal`).

### Out of scope
- "Choose Your Plan" grid below, sidebar, mobile-specific changes from earlier brand-scenes work.