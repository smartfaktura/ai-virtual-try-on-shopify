

## Goal
Shorter, punchier header copy for the upgrade modal on mobile (free user default state) while keeping the same strong intent. Desktop stays unchanged.

## Problem
Current free-user default copy:
- Title: *"Choose a plan to keep creating with VOVV"* (43 chars → wraps to 2 lines on 390px)
- Subtitle: *"Create more visuals, faster — with better value on larger plans"* (63 chars → wraps to 2 lines)

Combined: ~25% of the mobile viewport before user sees a single plan.

## Approach
Use existing `useIsMobile()` hook in `UpgradePlanModal.tsx` and pass `isMobile` into `getModalCopy()`. Return shorter variants on mobile for the affected free-user branches. Keep all other states (top-up, no-credits, low-credits, paid upgrade) reviewed for length too — only shorten where helpful.

## Copy changes (mobile only — desktop unchanged)

| State | Desktop (current) | Mobile (new) |
|---|---|---|
| Free, default | *Choose a plan to keep creating with VOVV* / *Create more visuals, faster — with better value on larger plans* | **Keep creating with VOVV** / *Pick a plan — better value as you scale* |
| Free, 0 credits / no-credits | *You've used all your credits* / *Choose a plan to keep creating with VOVV* | **Out of credits** / *Pick a plan to keep creating* |
| Free, 1–3 left | *Only N credits left* / *Pick a plan to keep your visuals flowing* | *(unchanged — already short)* |
| Top-up no-credits | *You've used all your credits* / *Top up to keep creating on your {plan} plan — credits add instantly* | **Out of credits** / *Top up your {plan} plan — instant* |
| Top-up | *Top up your credits* / *Add credits instantly — no plan change needed* | *(unchanged — already short)* |
| Paid upgrading | *Upgrade your plan* / *Unlock more credits and faster output each month* | *Upgrade your plan* / *More credits, faster output every month* |

Saves ~2 lines of vertical space on mobile, plans visible immediately above the fold.

## Files
- `src/components/app/UpgradePlanModal.tsx` — add `isMobile` param to `getModalCopy()`, branch copy strings, pass `useIsMobile()` from component.

## Out of scope
- Desktop copy
- Layout, modal sizing, button copy, plan rows
- Other modals (NoCreditsModal wraps this one — inherits automatically)

## Result
Free users on mobile see plans ~50–80px sooner. Same value message (keep creating, better value scaling), tighter execution. Desktop unchanged.

