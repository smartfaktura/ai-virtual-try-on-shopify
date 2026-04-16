

## Goal

Replace the small `+` icon button in the sidebar credits indicator with a proper labeled CTA ("Upgrade" for free users, "Top up" for paid users), give it a subtle animated gradient (non-purple), and stop the entire credits card from being clickable.

## Changes in `src/components/app/CreditIndicator.tsx`

### 1. Remove card-wide click target
- Remove `onClick={() => navigate('/app/settings')}` and `cursor-pointer` / hover bg from the outer container.
- The card becomes informational only. Actions live on the buttons.

### 2. Replace the `+` icon button with a labeled CTA
- Free plan (or any plan with `nextPlanId`): label = `Upgrade`, action = navigate to `/app/settings`.
- Paid plan with no upgrade path: label = `Top up`, action = `openBuyModal()`.
- Remove the separate inline "Upgrade ↗" text link — the new button replaces it, so the row is cleaner.

Result on the row:
```
[⚡] 0 / 20                  [ Upgrade ]
──── progress ────
```

### 3. Animated gradient (non-purple)
Use a warm/neutral premium gradient instead of brand purple. Direction:

- Gradient: amber → rose → orange (warm, premium, non-purple), using `bg-gradient-to-r from-amber-400 via-rose-400 to-orange-400`.
- Animate background position with the existing `animate-shimmer` pattern (already in the codebase, see `progress.tsx`) by using `bg-[length:200%_100%]` + `animate-shimmer`.
- Text: white, semibold, small (`text-xs`), tight padding (`h-7 px-3 rounded-lg`).
- Subtle hover: slight brightness increase, no scale.

### 4. Keep behavior
- No logic/pricing changes.
- `openBuyModal` and `navigate('/app/settings')` already exist in the component.
- Progress bar unchanged.

## Technical details

- File: `src/components/app/CreditIndicator.tsx`
- Reuse existing `animate-shimmer` keyframe (already defined in Tailwind config and used by `progress.tsx`).
- No new dependencies, no new tailwind config changes.

## Expected result

- Sidebar credits card is no longer a giant click target.
- The action is a clear, labeled button: `Upgrade` for free users, `Top up` for paid users.
- The button has a soft animated warm gradient (amber/rose/orange), not purple, matching the premium aesthetic without competing with primary CTAs elsewhere.

